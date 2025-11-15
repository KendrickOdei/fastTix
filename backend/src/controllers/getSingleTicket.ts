import { Request,Response,NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Ticket from "../models/ticket";
import Event from "../models/event";
import { AppError } from "../utils/AppError";


export const getSingleTicket = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {eventId,ticketId} = req.params;

    const event = await Event.findById(eventId)
    if(!event) throw new AppError('Event not found',404)

    const ticket = await Ticket.findOne({_id: ticketId, eventId})
    if(!ticket) throw new AppError('Ticket not found', 404)

    if(event.organizerId.toString() !==
     req.user?.id && req.user?.role !== 'admin'){
        throw new AppError('You are not authorized to view this ticket', 403)
    }

    res.status(200).json({
        success: true,
        message: 'Tickets fetched successfully',
        data: ticket
    })
})