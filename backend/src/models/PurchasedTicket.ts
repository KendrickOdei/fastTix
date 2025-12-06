import mongoose, {Document,Types,Schema} from "mongoose";
import { string } from "zod";

export interface IPurchasedTicket extends Document {
    _id: Types.ObjectId,
    userId: Types.ObjectId | null,
    name: string,
    email: string,
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
    quantity: number,
    totalAmount: number,
    purchaseCode: string,
    qrCode: string,
    status: 'pending' | 'success' | 'failed' | 'not_found';
    createdAt: Date
}

const PurchasedTicketSchema : Schema<IPurchasedTicket> = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false},
    eventId: {type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true},
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true},
    quantity: {type: Number, required: true},
    totalAmount: {type: Number, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    purchaseCode: {type: String, required: false},
    status: { 
        type: String, 
        enum: ['pending' , 'success' , 'failed' , 'not_found'], 
        default: 'pending' 
    },
    qrCode: {type: String, required: false},
    
},{timestamps: true})



const PurchasedTicket = mongoose.model('PurchasedTicket', PurchasedTicketSchema)

export default PurchasedTicket