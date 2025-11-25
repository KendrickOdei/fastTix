import {Request,Response, NextFunction } from "express";

import { IUser } from "../models/user";

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}




export const authorized =  (...roles: string[])=>{
    return(req:AuthRequest,res:Response, next:NextFunction) =>{

        if(!req.user || !roles.includes(req.user.role)){
             res.status(400).json({message: 'Access denied'})
             return;
        }

        next()
    }
    

  

}