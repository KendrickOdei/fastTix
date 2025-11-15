import {Request, Response, NextFunction} from 'express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { registerSchema } from '../schemas/schema';
import User from '../models/user';


export const register = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const results = registerSchema.safeParse(req.body);
    if(!results.success) throw new AppError('invalid data', 400);

    const {fullName,userName, email,password,role,country,organizationName,organizationLocation, isVerified}= results.data

    const userExists = await User.findOne({email: email.toString().toLowerCase()})

    if(userExists) throw new AppError('user already exists', 400)

    const newUser = new User({
        fullName: role === 'user'? fullName : undefined,
        userName: role === 'user' ? userName: undefined, 
        email,
        password,
        role,
        country,
        organizationName: role ==='organizer' ? organizationName : undefined,
        organizationLocation: role ==='organizer' ? organizationLocation : undefined,
        isVerified: false

    })
     await newUser.save()


     res.status(200).json({message: 'Registered successfully'})

     next()
})