import { Request,Response,NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Ticket from "../models/ticket";
import { AppError } from "../utils/AppError";
import Event from "../models/event";
import { ticketSchema } from "../schemas/schema";



export const createTicket = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {eventId} = req.params
    const event = await Event.findById(eventId)

    
    if(!event) throw new AppError('Event not found', 404)
    
    if(event.organizerId.toString() !== req.user?.id){
        throw new AppError('You are not authorizaed to create a ticket for this event', 403)
    }

    const results = ticketSchema.safeParse(req.body)
    if(!results.success)
    {
        throw new AppError(results.error.issues[0].message, 400)
    }

    const newTicket = await Ticket.create({
        ...results.data,
        eventId,
    })

    if(!newTicket) throw new AppError('Error creating ticket', 400)

    

    res.status(200).json({
    success: true,
    message: 'Ticket created successfully',
    data: newTicket,
    })

})