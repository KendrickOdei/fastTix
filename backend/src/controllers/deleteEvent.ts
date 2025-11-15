import { Request,Response,NextFunction } from "express";
import Event from "../models/event";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { clearEventCache } from '../utils/clearEventCache'

export const deleteEvent = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {id} = req.params

    const event = await Event.findById(id)
    if(!event) throw new AppError('EVENT NOT FOUND', 404)
    
    await Event.findByIdAndDelete(id)
    
    await clearEventCache(event.category)

    res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
    })
})