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
        const experts = [
            {
                name: 'Dr. Sarah Connor',
                category: 'Tech Consultant',
                experience: 10,
                rating: 4.8,
                availableSlots: [
                    { date: '2026-05-15', times: ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '02:00 PM - 03:00 PM'] },
                    { date: '2026-05-16', times: ['09:00 AM - 10:00 AM', '01:00 PM - 02:00 PM'] }
                ]
            },
            {
                name: 'John Smith',
                category: 'Career Coach',
                experience: 5,
                rating: 4.5,
                availableSlots: [
                    { date: '2026-05-15', times: ['09:00 AM - 10:00 AM', '03:00 PM - 04:00 PM'] },
                    { date: '2026-05-17', times: ['10:00 AM - 11:00 AM'] }
                ]
            },
            {
                name: 'Emily Davis',
                category: 'Fitness Trainer',
                experience: 8,
                rating: 4.9,
                availableSlots: [
                    { date: '2026-05-15', times: ['06:00 AM - 07:00 AM', '07:00 AM - 08:00 AM'] },
                    { date: '2026-05-16', times: ['06:00 AM - 07:00 AM', '05:00 PM - 06:00 PM'] }
                ]
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
