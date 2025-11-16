import { Request,Response, NextFunction} from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
//import { isRefreshJwtAllowed } from "../utils/refreshToken";
//import { signAccessToken, allowListJti } from "../utils/accessToken";
import jwt from 'jsonwebtoken'


//renew access tken when old one expires
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) throw new AppError("No refresh token", 400);

  // Verify token
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET!
  ) as any;

  // Issue new access token
  const newAccessToken = jwt.sign(
    {
      userId: decoded.userId,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  res.json({ accessToken: newAccessToken });
});
