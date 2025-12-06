// utils/ticketMailer.ts

import nodemailer from 'nodemailer';
import { generateTicketPdf,TicketPdfPayload } from './generateTicketPdf';
import PurchasedTicket, { IPurchasedTicket } from '../models/PurchasedTicket';





// --- 3. MAIN SENDER FUNCTION ---
export async function sendTicketEmail (payload: TicketPdfPayload)  {
    
    const pdfBuffer = await generateTicketPdf(payload)

    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: payload.email,
        subject: `Your E-Tickets for ${payload.eventTitle}`,
        html: `
            <h1> Your Tickets Are Ready!</h1>
            <p>Thank you for your purchase. Your ticket(s) for ${payload.eventTitle} are attached as pdf to this email.</p>
            <p>Please present the attached PDF at the event entrance for scanning.</p>
            <p>Purchase code: ${payload.purchaseCode}</p>
            <br/>
            <p>See you there!</p>
        `,
        attachments: [{
            filename: `tickets_${payload.purchaseCode}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    };
    
    await transporter.sendMail(mailOptions);
};