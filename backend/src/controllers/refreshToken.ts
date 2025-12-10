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
    throw new AppError("No refresh token", 400);
  }

  // Find the token in DB 
  const tokenDb = await RefreshToken.findOne({
    token: rawToken,                    // ← Direct string match
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDb) {
    throw new AppError('Refresh token invalid or expired', 401);
  }

  // Generate new access token
  const user = await User.findById(tokenDb.userId);
  if (!user) throw new AppError('User not found', 404);

  const payload = {
    userId: user._id,
    email: user.email,
    userName: user.userName,
    organizationName: user.organizationName,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

  res.json({ accessToken });
});
