import {Request,Response,NextFunction} from 'express'
import Ticket from '../models/ticket'
import Event from '../models/event'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'
import redisClient from '../utils/redisClient'


export const deleteTicket = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {eventId, ticketId} = req.params

    const event = await Event.findById(eventId);
    if(!event){
        throw new AppError('Event not found', 404)
    }

    const ticket = await Ticket.findOne({_id: ticketId, eventId})

    if(!ticket){
        throw new AppError('Ticket not found for this event', 404)
    }

    if(event.organizerId.toString() !== req.user?.id &&
    req.user?.role !== 'admin'){
        throw new AppError('Not authorized',403)
    }

    const deletedTicket = await Ticket.findByIdAndDelete(ticketId)

    await redisClient.del(`tickets:${eventId}`)

    res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: deletedTicket

    })
     
})