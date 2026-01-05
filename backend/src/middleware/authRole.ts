import {Request,Response, NextFunction } from "express";

import { IUser } from "../models/user";

interface AuthRequest extends Request {
  user?: IUser; // Match index.d.ts
}




export const authorized =  (...roles: string[])=>{
    return(req:AuthRequest,res:Response, next:NextFunction) =>{

        if (!req.user) {
           res.status(401).json({ message: 'Not authenticated' });
           return;
        }

        if (!roles.includes(req.user.role)) {
           res.status(403).json({ message: 'Access denied' });
           return;
        }


        next()
    }
    

  

}