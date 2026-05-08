import express from 'express';
import Expert from '../models/Expert';
import Booking from '../models/Booking';

const router = express.Router();

// GET /experts (with pagination + filter)
router.get('/experts', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const category = req.query.category as string;
        const search = req.query.search as string;

        const query: any = {};
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const experts = await Expert.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Expert.countDocuments(query);

        res.json({
            experts,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// GET /experts/:id
router.get('/experts/:id', async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) {
            return res.status(404).json({ message: 'Expert not found' });
        }
        res.json(expert);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// POST /bookings
router.post('/bookings', async (req, res) => {
    try {
        const { expertId, userName, userEmail, userPhone, date, timeSlot, notes } = req.body;

        if (!expertId || !userName || !userEmail || !userPhone || !date || !timeSlot) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newBooking = new Booking({ expertId, userName, userEmail, userPhone, date, timeSlot, notes });
        await newBooking.save();

        // Emit socket event here. We will pass io in req.app.get('io') in index.ts
        const io = req.app.get('io');
        if (io) {
            io.emit('slotBooked', { expertId, date, timeSlot });
        }

        res.status(201).json(newBooking);
    } catch (err: any) {
        // Handle MongoDB unique index violation (double booking)
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Time slot already booked for this expert and date.' });
        }
        res.status(500).json({ message: err.message });
    }
});

// PATCH /bookings/:id/status
router.patch('/bookings/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// GET /bookings?email=
router.get('/bookings', async (req, res) => {
    try {
        const email = req.query.email as string;
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required' });
        }

        const bookings = await Booking.find({ userEmail: email }).populate('expertId', 'name category');
        res.json(bookings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
