import { Request,Response, NextFunction} from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
//import { isRefreshJwtAllowed } from "../utils/refreshToken";
//import { signAccessToken, allowListJti } from "../utils/accessToken";
import jwt from 'jsonwebtoken'
import { RefreshToken } from "../models/refreshToken";
import bcrypt from 'bcryptjs'


//renew access tken when old one expires
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const  rawToken = req.cookies.refreshToken;

  if (!rawToken) throw new AppError("No refresh token", 400);

  // find token in database
  const tokenDb = await RefreshToken.findOne({expiresAt: {$gt:
    new Date()
  }})

  if(!tokenDb) throw new AppError('Refresh token invalid', 401);

const isMatch = await bcrypt.compare(rawToken, tokenDb.token);
if(!isMatch) throw new AppError('Refresh token invalid', 401);
  //issue new access token

  const accessToken = jwt.sign(
    {userId: tokenDb.userId},
    process.env.JWT_SECRET! as string,
    {expiresIn: '1h'}
  )

  res.json({ 
    accessToken
    
 });
});
