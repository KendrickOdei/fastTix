// import { Request,Response,NextFunction } from "express";
// import redisClient from "../utils/redisClient";
// import { AppError } from "../utils/AppError";
// import { asyncHandler } from "../utils/asyncHandler";
// import { IUser } from "../models/user";

// declare global {
//     namespace Express{
//         interface Request {
//             user?: IUser
//         }
//     }
// }



// export const rateLimiter = (limit: number, windowSeconds: number) => {
//     return asyncHandler(async(req:Request, res:Response, next:NextFunction) =>{
       
//         const key = `rate-limit:${req.user?.id || req.ip}`

//         const current = await redisClient.incr(key)

//         if (current === 1) {
//             await redisClient.expire(key, windowSeconds)
//         }

//         if(current > limit) {
//             const ttl = await redisClient.ttl(key)

//             throw new AppError(`Too many requests: Try again in ${ttl}s`, 429)
//         }
//     })
// }