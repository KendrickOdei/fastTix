import mongoose, { Schema, Types, Document } from "mongoose"

export interface ITicket extends Document {
    name: string,
    price: number,
    quantity: number,
    remaining: number,
    saleStart?: Date,
    saleEnd?: Date,
    eventId: Types.ObjectId
}

const ticketSchema: Schema<ITicket> = new Schema({
    name: {type: String, required: true },
    price: {type: Number, required: true, min:0 },
    quantity: {type: Number, required: true},
    remaining: {type: Number, required: false,  },
    saleStart: {type: Date, required: false,},
    saleEnd: {type: Date, required: false},
    eventId: {type: Schema.Types.ObjectId, ref: 'Event', required: true}

 },{timestamps: true})

 ticketSchema.pre('save', function (next){
    if(!this.remaining){
        this.remaining = this.quantity
    }
    next()
 })



const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket