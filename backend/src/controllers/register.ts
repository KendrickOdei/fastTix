import {Request, Response, NextFunction} from 'express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
//import { registerSchema } from '../schemas/schema';
import User from '../models/user';


export const register = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    
    const {fullName,userName, email,password,role,country,organizationName,location, isVerified}= req.body

    const userExists = await User.findOne({email: email.toString().toLowerCase()})

    if(userExists) throw new AppError('user already exists', 400)

    const newUser = new User({
        ...(role === 'user' && {fullName}),
        ...(role === 'user' && {userName}), 
        email: email.toLowerCase(),
        password,
        role,
        country,
        ...( role ==='organizer' && {organizationName }),
        ...(role ==='organizer' && {location }),
        isVerified: false

    })
     await newUser.save()


     res.status(200).json({message: 'Registered successfully'})

     next()
})