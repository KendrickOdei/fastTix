// utils/sendOtpEmail.ts
import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,       // smtp.office365.com
        port: Number(process.env.SMTP_PORT), // 587
        secure: false,                     // true for 465, false for 587
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
  


  await transporter.sendMail(mailOptions);
transporter.verify((err,success)=>{
    console.log(err || success)
})
};
