import mongoose, { Document, Schema } from 'mongoose';

export interface IExpert extends Document {
    name: string;
    category: string;
    experience: number;
    rating: number;
    availableSlots: {
        date: string; // YYYY-MM-DD
        times: string[]; // ["10:00 AM - 11:00 AM", ...]
    }[];
}

const ExpertSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: Number, required: true },
    rating: { type: Number, required: true },
    availableSlots: [
        {
            date: { type: String, required: true },
            times: [{ type: String, required: true }]
        }
    ]
}, { timestamps: true });

export default mongoose.model<IExpert>('Expert', ExpertSchema);
