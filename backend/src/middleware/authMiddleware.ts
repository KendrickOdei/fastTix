import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { AppError } from '../utils/AppError';
import { isJtiAllowed } from '../utils/accessToken';

export interface AuthRequest extends Request {
  user?: IUser;
}

// Middleware to verify JWT and get organizer
const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
     res.status(401).json({ message: 'No token provided' });
     return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any

    const jwtId = decoded.jwtId
    if(!jwtId) throw new AppError('invalid token (missing jti)', 401)

      //check redis to ensure token is valid
    
    const userIdInRedis = await isJtiAllowed(jwtId)
    if(!userIdInRedis) throw new AppError('Token revoked or expired', 401)

    const user = await User.findById(decoded.id)
    if(!user) throw new AppError('User not foiund', 404)
   
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
export default authMiddleware;
