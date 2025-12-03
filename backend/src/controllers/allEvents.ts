import {Request,Response,NextFunction} from 'express'
import Event from '../models/event'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'


export const allEvents = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{

    
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 9
    const category = req.query.category?.toString() || ""
    const search = req.query.q?.toString() || "";



    const filterEvent: any =  {}

    if(search){
        filterEvent.title = {$regex: search, $options: "i"}
    }

    if(category && category.toLowerCase() !== 'all'){
        filterEvent.category = category
    }

    const skip = (page - 1) * limit

    const events = await Event.find(filterEvent)
    .populate('organizerId','organizationName')
    .skip(skip)
    .limit(limit)
    .sort({createdAt: -1})

    

    const total = await Event.countDocuments(filterEvent)

    const responseBody = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total/limit),
        results: events

    }
    res.status(200).json(responseBody)
})