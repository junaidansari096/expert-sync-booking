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
        availableSlots: []
    },
    {
        name: 'John Smith',
        category: 'Career Coach',
        experience: 5,
        rating: 4.5,
        availableSlots: []
    },
    {
        name: 'Emily Davis',
        category: 'Fitness Trainer',
        experience: 8,
        rating: 4.9,
        availableSlots: []
    }
];

const generateSlots = (daysToGenerate: number) => {
    const slots = [];
    let currentDate = new Date();
    let addedDays = 0;
    
    // Create 6 slots: 1.5 hrs each, with a 2-hour break after the 3rd slot
    const dailyTimes = [
        '09:00 AM - 10:30 AM',
        '10:30 AM - 12:00 PM',
        '12:00 PM - 01:30 PM',
        // 2 hr break: 01:30 PM to 03:30 PM
        '03:30 PM - 05:00 PM',
        '05:00 PM - 06:30 PM',
        '06:30 PM - 08:00 PM'
    ];

    while (addedDays < daysToGenerate) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
        
        // Skip weekends
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            slots.push({
                date: dateStr,
                times: [...dailyTimes] // clone the array
            });
            addedDays++;
        }
    }
    return slots;
};

// Assign dynamic slots to all experts
const dynamicSlots = generateSlots(7); // Next 7 weekdays
experts.forEach(expert => {
    expert.availableSlots = JSON.parse(JSON.stringify(dynamicSlots)); // deep copy so they have independent slots
});

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
