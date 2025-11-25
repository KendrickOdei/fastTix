import { Request,Response,NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Ticket from "../models/ticket";
import { AppError } from "../utils/AppError";
import Event from "../models/event";
import { ticketSchema } from "../schemas/schema";
import { IUser } from "../models/user";

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}


export const createTicket = asyncHandler(async(req:AuthRequest,res:Response,next:NextFunction)=>{
    const {eventId} = req.params
    const event = await Event.findById(eventId)

    
    if(!event) throw new AppError('Event not found', 404)
    
    if(event.organizerId.toString() !== req.user?.id){
        throw new AppError('You are not authorizaed to create a ticket for this event', 403)
    }

   const ticketsData = req.body

   const ticketsToCreate = Array.isArray(ticketsData) ? ticketsData : [ticketsData]

   const validatedTickets = ticketsToCreate.map((ticket,index)=>{
    const result = ticketSchema.safeParse(ticket)
    if(!result.success) {
        throw new AppError(`Ticket ${index + 1}: ${result.error?.issues[0].message}`, 400)
    }
    return result.data
   })

   const createdTickets = await Ticket.insertMany(
    validatedTickets.map(t => ({
        ...t,
        eventId,
        organizerId: req.user?.id,
        remaining: t.quantity
    }))
   )
    

    res.status(201).json({
    success: true,
    message: `${createdTickets.length} tickets created successfully`,
    data: createdTickets,
    })

})