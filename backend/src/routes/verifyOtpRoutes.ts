import express from 'express';
import { Request, Response } from 'express';

import OtpModel from '../models/otp';
import crypto from 'crypto';
import { body,validationResult } from 'express-validator';
import User from '../models/user';

const router = express.Router();




router.post(
    '/verify-otp',
    [
      body('email').isEmail().withMessage('Valid email is required'),
      body('otp').notEmpty().withMessage('OTP is required'),
    ],
    async (req: Request, res: Response): Promise<void> => {

        const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
      const { email, otp } = req.body;
  
      // Hash the incoming OTP for comparison
      const hash = crypto.createHash('sha256').update(otp).digest('hex');
  
      // Find OTP record
      const otpEntry = await OtpModel.findOne({ email });
  
      if (!otpEntry) {
        res.status(400).json({ message: 'No OTP found for this email' });
        return;
      }
  
      const isExpired = otpEntry.createdAt.getTime() + 5 * 60 * 1000 < Date.now(); // 5 mins
      const isValid = otpEntry.otp === hash;
  
      if (!isValid || isExpired) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
      }

      const user = await User.findOne({ email });

      
      
      if (!user) {
        res.status(404).json({ message: 'User can not be found' });
        return;
      }
    
      // Set the isVerified field to true
      user.isVerified = true;
      await user.save();
  
      // Clean up OTP entry
      await OtpModel.deleteOne({ email });
  
      res.status(200).json({ message: 'Email verified successfully' });
    }
  );

  export default router;