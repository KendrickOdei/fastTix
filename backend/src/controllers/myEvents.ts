import { Request,Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import Event from "../models/event";
import { IUser } from "../models/user";

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}


export const myEvents = asyncHandler(async(req:AuthRequest,res:Response,next:NextFunction)=>{
    const userId = req.user?.id

    const eventsCreated = await Event.find({organizerId: userId}).populate('organizerId', 'organizationName').sort({createdAt: -1})
    if(!eventsCreated) throw new AppError('NO EVENTS CREATED', 400)
    
    res.status(200).json(eventsCreated)
})