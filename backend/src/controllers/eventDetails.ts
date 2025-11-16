import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import Event from "../models/event";




export const eventDetails = asyncHandler(async(req:Request,res:Response,NextFunction)=>{

        const eventId = req.params.id
        
        const event = await Event.findById(eventId).populate('organizerId', 'organizationName')
        
        if(!event) throw new AppError('EVENT NOT FOUND', 404)
        
        
        
        res.status(200).json(event)
})