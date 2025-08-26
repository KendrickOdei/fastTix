import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { body, validationResult,  } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware'

import  { IUser } from '../models/user';

export interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').if(body('role').equals('user')).notEmpty().withMessage('First name is required for users'),
    body('lastName').if(body('role').equals('user')).notEmpty().withMessage('Last name is required for users'),
   body('userName').if(body('role').equals('user')).notEmpty().withMessage('username is required for users'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['user', 'organizer']).withMessage('Invalid role'),
    body('country').notEmpty().withMessage('Country is required'),
    body('organizationName')
      .if(body('role').equals('organizer'))
      .notEmpty()
      .withMessage('Organization name is required for organizers'),
    body('organizationLocation')
      .if(body('role').equals('organizer'))
      .notEmpty()
      .withMessage('Location is required for organizers'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firstName, lastName,userName, email, password, role, organizationName, organizationLocation, country } =
      req.body;

    try {
      const userExists = await User.findOne({ email: email.trim().toLowerCase() });
      

      if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const user = new User({
        firstName: role === 'user' ? firstName : undefined,
        lastName: role === 'user' ? lastName : undefined,
        userName: role === 'user' ? userName : undefined,
        email: email.trim().toLowerCase(),
        password,
        role,
        country,
        organizationName: role === 'organizer' ? organizationName : undefined,
        organizationLocation: role === 'organizer' ? organizationLocation : undefined,
        
        isVerified: false,
      });

      await user.save();
      

      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value) => {
      if (!value.email && !value.userName) {
        throw new Error('Email or Username is required');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, userName, password } = req.body;

    try {
      let user;

      if (email) {
        user = await User.findOne({ email: email.trim().toLowerCase() });
      } else if (userName) {
        user = await User.findOne({ userName: userName.trim() });
      }

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = {
        userId: user._id.toString(),
        email: user.email,
        userName: user.userName,
        role: user.role,
      };

      const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '7d',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Login successful',
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      console.error("login error: ", error.message || error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


// Refresh token endpoint
router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { refreshToken } = req.body;

    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }

      // Generate a new access token
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

      // Optionally generate a new refresh token
      const newRefreshToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '7d', 
      });

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }
);

router.get("/validate-token", authMiddleware, (req:AuthRequest , res: Response) => {
  res.status(200).json({ userId: req.user?._id, role: req.user?.role });
});

router.post('/logout',(req:Request, res:Response)=>{
  try{
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: true, 
      sameSite: 'strict',
      expires: new Date(0), 
    });

    res.status(200).json({message:'logout successful'})
  }catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
})
export default router;