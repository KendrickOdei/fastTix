import {Request,Response, NextFunction } from "express";






export const authorized =  (...roles: string[])=>{
    return(req:Request,res:Response, next:NextFunction) =>{

        if(!req.user || !roles.includes(req.user.role)){
             res.status(400).json({message: 'Access denied'})
             return;
        }

        next()
    }
    

  

}