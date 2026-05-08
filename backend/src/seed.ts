import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expert from './models/Expert';
import connectDB from './config/db';

dotenv.config();

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

const seedData = async () => {
    try {
        await connectDB();
        await Expert.deleteMany();
        await Expert.insertMany(experts);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedData();
