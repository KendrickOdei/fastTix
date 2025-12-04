import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { AppError } from '../utils/AppError';


export interface AuthRequest extends Request {
  user?: IUser;
}

// Middleware to verify JWT and get organizer
const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
     req.user = undefined
      next();
      return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {userId: string}

    const user = await User.findById(decoded.userId)
    if(!user) {
      req.user = undefined;
       next();
       return;
    }
   
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
export default authMiddleware;
