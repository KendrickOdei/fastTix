import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { eventSchema } from "../schemas/schema";
import Event from "../models/event";
import { asyncHandler } from "../utils/asyncHandler";

import {v2 as cloudinary} from "cloudinary"
import dotenv from 'dotenv'
import { clearEventCache } from '../utils/clearEventCache'


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const createEvent = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const results = eventSchema.safeParse(req.body)
    if(!results.success) throw new AppError('invalid data', 400)
    
    const {title, description, date, time, venue, price, category} = results.data

    const files = (req.files ?? {}) as { [fieldname: string]: Express.Multer.File[] };


    const streamUpload = (fileBuffer: Buffer, folder: string): Promise<any> => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(fileBuffer);
          });
        };

    let imageUrl: string | undefined;
    if (files['image'] && files['image'][0]) {
      const result = await streamUpload(files['image'][0].buffer, 'fasttix/events');
      imageUrl = result.secure_url;
    }

    const newEvent = new Event({
    title,
    description,
    date,
    time,
    venue,
    price,
    category,
    image: imageUrl
})
if(!newEvent) throw new AppError('error creating event', 404)

await clearEventCache(newEvent.category)

 await newEvent.save()
 res.status(200).json({
    success: true,
    mesage: 'Event created successfully',
    data: newEvent})


})

