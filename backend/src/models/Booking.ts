import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
    expertId: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    userPhone: string;
    date: string; // YYYY-MM-DD
    timeSlot: string;
    notes?: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const BookingSchema: Schema = new Schema({
    expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

// Prevent double booking using a unique compound index (ignore cancelled bookings)
BookingSchema.index(
    { expertId: 1, date: 1, timeSlot: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { status: { $ne: 'Cancelled' } } 
    }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
