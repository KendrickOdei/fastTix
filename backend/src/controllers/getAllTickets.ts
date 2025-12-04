import {Request, Response, NextFunction} from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import Ticket from '../models/ticket'
import Event from '../models/event'
import { AppError } from '../utils/AppError'
import { IUser } from "../models/user";

interface AuthRequest extends Request {
  user?: IUser; 
}



export const getAllTickets = asyncHandler(async(req:AuthRequest,res:Response,next:NextFunction)=>{
    const {eventId} = req.params

    const event = await Event.findById(eventId)

    if(!event) throw new AppError('Event not found', 404)
    
   
   
  const ticketTypes = await Ticket.find({eventId}).sort({createdAt: 1}).populate("eventId")

    res.status(200).json({
        success: true,
        message: 'Ticket types fetched successfully',
        count: ticketTypes.length,
        data: ticketTypes.map(t=>({
          _id: t._id,
          name: t.name,
          price: t.price,
          currency: t.currency || 'GHS',
          quantity: t.quantity,
          sold: t.sold || 0,
          remaining: t.remaining || t.quantity,
          status: t.status || 'active',
          type: t.type || 'paid',
          eventId: t.eventId
        }))
    })
})