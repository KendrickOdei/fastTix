import mongoose, { Schema, Types, Document } from "mongoose"

export interface ITicket extends Document {
    name: string,
    description: string,
    price: number,
    currency: string,
    sold: number,
    type: 'paid' | 'free' | 'donation',
    minPerOrder: number,
    maxPerOrder: number,
    quantity: number,
    remaining: number,
    status: "active" | "paused"|"sold_out"|"hidden",
    saleStart?: Date,
    saleEnd?: Date,
    eventId: Types.ObjectId
}

const ticketSchema: Schema<ITicket> = new Schema({
    name: {type: String, required: true },
    description: {type: String},
    price: {type: Number, required: true, min:0 },
    currency: {type: String, default: "GHS"},
    quantity: {type: Number, required: true},
    sold: {type: Number, default: 0},
    type: {type: String, enum: ["paid","free","donation"],default: "paid"},
    minPerOrder: {type: Number, default: 1},
    maxPerOrder: {type: Number, default: 10},
    remaining: {type: Number, required: true,  },
    status: {type: String, enum: ["active", "paused","sold_out","hidden"], default: "active"},
    saleStart: {type: Date, required: false,},
    saleEnd: {type: Date, required: false},
    eventId: {type: Schema.Types.ObjectId, ref: 'Event', required: true}

 },{timestamps: true})
 

 ticketSchema.pre('save', function (next){
    
        this.remaining = this.quantity - this.sold
    
    next()
 })



const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket