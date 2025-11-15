import { Request,Response, NextFunction} from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { isRefreshJwtAllowed } from "../utils/refreshToken";
import { signAccessToken, allowListJti } from "../utils/accessToken";
import jwt from 'jsonwebtoken'


//renew access tken when old one expires
export const refresh = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const refreshToken = req.body

    //verify refresh token's signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any

    // check redis if refresh token is still valid
    const allowed = await isRefreshJwtAllowed(decoded.jwtId)
    if(!allowed) throw new AppError('refresh token revoked', 403)
    
    //Issue new access token
    const {token: newAccessToken, jwtId: newAccessJwtId} = signAccessToken({userId: decoded.userId})

    await allowListJti(newAccessJwtId, decoded.userId,60 * 15)

    res.json({accessToken: newAccessToken})
})