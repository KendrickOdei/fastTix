import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware'

import  { IUser } from '../models/user';
import { register } from '../controllers/register';
import { login } from '../controllers/login';
import { rateLimiter } from '../middleware/rateLimiter';

import { rateLimiterByRole } from '../middleware/rateLimiterByRole';

import { refresh } from '../controllers/refreshToken';
import { logout } from '../controllers/logout';


export interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

router.get('/test', rateLimiter(5,60), (req,res)=>{
  res.json({message: 'You are within the limit'})
})

router.post('/register', register)

router.post('/login',login)


router.post('/refresh-token', refresh)

router.post('/logout',logout)


router.get("/validate-token", authMiddleware, (req:AuthRequest , res: Response) => {
  res.status(200).json({ userId: req.user?._id, role: req.user?.role });
});


export default router;