import mongoose, { Document, Types, Schema } from "mongoose";
import { ITicket } from "./ticket";
import { IEvent } from "./event";

export interface IPurchasedTicket extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | null;
  name: string;
  email: string;
  eventId: Types.ObjectId;


  // NEW: Multiple ticket types in one order
  tickets: {
    ticketId: Types.ObjectId | (ITicket & { eventId: Types.ObjectId | IEvent });
    quantity: number;
    price: number;
  }[];

  totalAmount: number;
  purchaseCode: string;
  qrCode: string;
  status: 'pending' | 'success' | 'failed' | 'not_found';
  createdAt: Date;
  updatedAt: Date;
}

const PurchasedTicketSchema: Schema<IPurchasedTicket> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },

  
  // THIS IS THE KEY CHANGE — ARRAY OF TICKETS
  tickets: [{
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  }],

  totalAmount: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  purchaseCode: { type: String, required: true, unique: true },
  qrCode: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'not_found'], 
    default: 'pending' 
  },
}, { timestamps: true });



const PurchasedTicket = mongoose.model<IPurchasedTicket>('PurchasedTicket', PurchasedTicketSchema);
export default PurchasedTicket;