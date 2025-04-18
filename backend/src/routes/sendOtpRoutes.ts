// routes/otp.ts
import express from 'express';

import { sendOtpEmail } from '../utils/sendEmail';
import OtpModel from '../models/otp';
import crypto from 'crypto';



const router = express.Router();

// Send email OTP
router.post('/send-otp', async (req, res) => {
  const email = req.body.email.trim().toLowerCase(); // sanitize + normalize

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const hash = crypto.createHash('sha256').update(otp).digest('hex');

  try {
    await OtpModel.deleteMany({ email }); // remove any previous OTP
    await new OtpModel({ email, otp: hash }).save();
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' ,otp});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify email OTP


  // sending phone otps

  

export default router;
