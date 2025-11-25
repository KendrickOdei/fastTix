// import { Request,Response,NextFunction } from "express";
// import redisClient from "../utils/redisClient";
// import { AppError } from "../utils/AppError";
// import { asyncHandler } from "../utils/asyncHandler";



// export const rateLimiterByRole = asyncHandler(async(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) =>{
//     const identifier = req.user?.id || req.ip
//     const role = req.user?.role || 'guest'

//    const key = `rate-limit:${role}: ${identifier}`

//    const now = Date.now()

//    const limits: Record<string, {limit: number; windowMs: number}> = {
//     admin: {limit: 1000, windowMs: 60 * 1000},
//     organizer: {limit: 50, windowMs: 60 * 1000},
//     user: {limit: 20, windowMs: 60 * 1000},
//     guest: {limit: 10, windowMs: 60 * 1000}
//    }

//    const {limit , windowMs} = limits[role] || limits["guest"]

//    // clear old timestamps
//    await redisClient.zRemRangeByScore(key,0, now - windowMs)

//    // add current timestamps

//    await redisClient.zAdd(key, [{score: now, value: now.toString()}])

//    // count timestamps remaining

//    const count = await redisClient.zCard(key);

//    // set key expiry

//    await redisClient.expire(key, Math.ceil(windowMs / 1000) + 2)

//    // block if limit exceeded

//    if (count > limit) {
//     const oldest = await redisClient.zRangeWithScores(key,0,0,)

//     const oldestTimestamp = Number(oldest[0]?.score ?? now)

//     const retryAfterMs = windowMs - ( now - oldestTimestamp)

//     const retryAfterSec = Math.ceil(retryAfterMs/1000)

//     throw new AppError(
//         `Too many requests (${count}/${limit}), try agin in ${retryAfterSec}`,
//         429
//     )
//    }

//    next()

// })