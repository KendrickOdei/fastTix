import {Request,Response,NextFunction} from 'express'
import Event from '../models/event'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'


export const allEvents = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{

    
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const category = req.query.category || ""
    const search = req.query.search || ""



    const filterEvent: any =  {}

    if(search){
        filterEvent.name = {$regex: search, $options: "i"}
    }

    if(category){
        filterEvent.category = category
    }

    const skip = (page - 1) * limit
    const events = await Event.find(filterEvent).populate('organizerId','organizationName')
    .skip(skip)
    .limit(limit)
    .sort({createdAt: -1})

    

    const total = await Event.countDocuments(filterEvent)

    if(events.length === 0) {throw new AppError('no events for today' ,404)}

    const responseBody = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total/limit),
        results: events

    }
    res.status(200).json(responseBody)
})