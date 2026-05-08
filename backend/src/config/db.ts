import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        await mongoose.connect(uri);
        console.log('MongoDB Connected successfully...');
    } catch (err: any) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
