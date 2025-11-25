import { Request,Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
//import { revokeRefreshJwtId, } from "../utils/refreshToken";

import { RefreshToken } from "../models/refreshToken";
import bcrypt from "bcryptjs";

export const logout= asyncHandler(async(req:Request, res:Response)=>{
    const rawToken = req.cookies.refreshToken;
    if(rawToken){
        const tokenDoc = await RefreshToken.find();
        for (const doc of tokenDoc){
            if(await bcrypt.compare(rawToken, doc.token)){
                await doc.deleteOne()
            }
        }
    }
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })
    res.json({message: 'Logged out.'})
})