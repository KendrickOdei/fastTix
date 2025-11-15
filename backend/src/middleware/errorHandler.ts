import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError";



export const errorHandler = (
    
    error: any ,
    req: Request,
    res:Response,
    next: NextFunction

): void => {
    console.error('Error caught by middleware', error)
    // handles invalid MongoDb error
    if (error.name === ' CastError'){
         res.status(400).json({
            status: 'fail',
            message: 'Invalid ID format'
        })
        return;
    }
    // handles custom AppError
    if (error instanceof AppError){
         res.status(error.statusCode).json({success: false, message: error.message})
         return;
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    })
}