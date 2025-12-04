// src/models/order.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrder extends Document {
    user: Types.ObjectId | null; 
    ticket: Types.ObjectId;
    event: Types.ObjectId; 
    quantity: number;
    amountPaid: number; 
    paystackReference: string;
    status: 'pending' | 'paid' | 'failed';
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    quantity: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    paystackReference: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'paid' // Set to paid immediately after successful webhook verification
    },
}, { timestamps: true });

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;