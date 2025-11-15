// utils/sendOtpEmail.ts
import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",                    // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
    
  };
  
transporter.verify((err,success)=>{
    if(err) console.error('SMTP verify error:', err);
    else console.log("SMTP Server ready:", err)
})

  await transporter.sendMail(mailOptions);

};
