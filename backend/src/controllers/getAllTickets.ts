import {Request, Response, NextFunction} from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import Ticket from '../models/ticket'
import Event from '../models/event'
import { AppError } from '../utils/AppError'
import redisClient from '../utils/redisClient'


export const getAllTickets = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {eventId} = req.params

    const event = await Event.findById(eventId)

    if(!event) throw new AppError('Event not found', 404)
    
    if(event.organizerId.toString() !==
     req.user?.id && req.user?.role !== 'admin'
   ){
    throw new AppError('You are not authorized to view tickets for this event', 403)
   }
   
     const cachedTickets = await redisClient.get(`tickets:${eventId}`);
  if (cachedTickets) {
    const parsedTickets = JSON.parse(cachedTickets);
    return res.status(200).json({
      success: true,
      source: 'cache',
      message: 'Tickets fetched successfully',
      count: parsedTickets.length,
      data: parsedTickets,
    });
  }
   const tickets = await Ticket.find({eventId})

   if(!tickets || tickets.length === 0) throw new AppError('No tickets for found for this event', 404)

   await redisClient.setEx(`tickets:${eventId}`, 60, JSON.stringify(tickets))

    res.status(200).json({
        success: true,
        message: 'Tickets fetched successfully',
        count: tickets.length,
        data: tickets
    })
})