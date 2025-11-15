import { Request,Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { revokeRefreshJwtId, } from "../utils/refreshToken";
import jwt from 'jsonwebtoken'

export const logout= asyncHandler(async(req:Request, res:Response)=>{
    const {refreshToken} = req.body
    if(!refreshToken) throw new AppError('Refresh token required',400)
    
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any

        await revokeRefreshJwtId(decoded.jwtId, decoded.userId)

        res.json({message: 'Logged out.'})
})