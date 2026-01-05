import { Request,Response, NextFunction} from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import jwt from 'jsonwebtoken'
import { RefreshToken } from "../models/refreshToken";
import User from "../models/user";



//renew access tken when old one expire


export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies.refreshToken;

 if (!rawToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  // Find the token in DB 
  const tokenDb = await RefreshToken.findOne({
    token: rawToken,                    
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDb) {
    throw new AppError('Refresh token invalid or expired', 401);
  }

  const user = await User.findById(tokenDb.userId);
  if (!user) {
  // delete orphan refresh token
  await RefreshToken.deleteOne({ _id: tokenDb._id });

  // clear cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  throw new AppError('Session expired', 401);
}
  // Generate new access token

  const payload = {
    userId: user._id,
    email: user.email,
    organizationName: user.organizationName,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

  res.json({ accessToken });
});
