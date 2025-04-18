
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  price: number;
  ticketsAvailable: number;
  organizerId: Types.ObjectId;
  createdAt: Date;
  image?: string ;
}

const eventSchema: Schema<IEvent> = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  ticketsAvailable: { type: Number, required: true, min: 0 },
  organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, required: false },
});

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;