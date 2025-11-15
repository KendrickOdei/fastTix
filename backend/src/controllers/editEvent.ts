import {Request,Response,NextFunction} from 'express'
import { AppError } from '../utils/AppError'
import Event from '../models/event'
import { asyncHandler } from '../utils/asyncHandler'
import { clearEventCache } from '../utils/clearEventCache'


export const editEvent = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const event = await Event.findById(req.params.id)
    
    if(!event) throw new AppError('EVENT NOT FOUND', 404)
    
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id,
        {$set: req.body},
        {new: true, runValidators: true}
    ).populate('organizerId', 'organizationName')

    if(!updatedEvent) throw new AppError('Event not found', 404)

    await clearEventCache(updatedEvent.category)

    res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
    })
})