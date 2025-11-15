import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import Event from "../models/event";
import redisClient from "../utils/redisClient";



export const eventDetails = asyncHandler(async(req:Request,res:Response,NextFunction)=>{

        const eventId = req.params.id
        const cachedKey = `event:${eventId}`

        const cachedEvent = await redisClient.get(cachedKey)
        
        if(cachedEvent){
                return res.status(200).json(JSON.parse(cachedKey))
        }
        const event = await Event.findById(eventId).populate('organizerId', 'organizationName')
        
        if(!event) throw new AppError('EVENT NOT FOUND', 404)
        
        await redisClient.setEx(cachedKey, 60, JSON.stringify(event))
        
        res.status(200).json(event)
})