import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import apiRoutes from './routes/api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // For development. Change in production.
        methods: ['GET', 'POST', 'PATCH']
    }
});

// Make io accessible to our router
app.set('io', io);

import Expert from './models/Expert';

// Connect to database
connectDB().then(async () => {
    // Seed initial data if empty
    const count = await Expert.countDocuments();
    if (count === 0) {
        const generateSlots = (daysToGenerate: number) => {
            const slots = [];
            let currentDate = new Date();
            let addedDays = 0;
            const dailyTimes = [
                '09:00 AM - 10:30 AM',
                '10:30 AM - 12:00 PM',
                '12:00 PM - 01:30 PM',
                '03:30 PM - 05:00 PM',
                '05:00 PM - 06:30 PM',
                '06:30 PM - 08:00 PM'
            ];
            while (addedDays < daysToGenerate) {
                currentDate.setDate(currentDate.getDate() + 1);
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    slots.push({ date: dateStr, times: [...dailyTimes] });
                    addedDays++;
                }
            }
            return slots;
        };

        const dynamicSlots = generateSlots(7);

        const experts = [
            {
                name: 'Dr. Sarah Connor',
                category: 'Tech Consultant',
                experience: 10,
                rating: 4.8,
                availableSlots: JSON.parse(JSON.stringify(dynamicSlots))
            },
            {
                name: 'John Smith',
                category: 'Career Coach',
                experience: 5,
                rating: 4.5,
                availableSlots: JSON.parse(JSON.stringify(dynamicSlots))
            },
            {
                name: 'Emily Davis',
                category: 'Fitness Trainer',
                experience: 8,
                rating: 4.9,
                availableSlots: JSON.parse(JSON.stringify(dynamicSlots))
            }
        ];
        await Expert.insertMany(experts);
        console.log('Seeded initial experts.');
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
