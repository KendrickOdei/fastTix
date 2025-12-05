// utils/ticketMailer.ts

import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import Ticket from '../models/ticket';
import Event from '../models/event'; // Assuming you have an Event model
import PurchasedTicket, { IPurchasedTicket } from '../models/PurchasedTicket';

// --- 1. QR CODE GENERATOR ---
async function generateQrCodeBuffer(data: string): Promise<string> {
    // Generate QR code as a data URL (base64 string)
    return await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
}

// --- 2. PDF GENERATOR ---
async function generateTicketPDF(ticketRecord: IPurchasedTicket, qrCodeDataUrl: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Fetch related details
        const ticketDetails = await Ticket.findById(ticketRecord.ticketId);
        const eventDetails = await Event.findById(ticketRecord.eventId);

        // Styling for a simple digital ticket
        doc.fontSize(28).fillColor('#10b981').text('Official E-Ticket', { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).fillColor('#000000').text(eventDetails?.title || 'Event Title Missing', { align: 'center' });
        doc.moveDown(0.5);
        
        doc.fontSize(14).text(`Ticket Type: ${ticketDetails?.name || 'Standard'}`, { align: 'left' });
        doc.text(`Quantity: ${ticketRecord.quantity}`, { align: 'left' });
        doc.text(`Total Paid: GHS ${ticketRecord.totalAmount.toFixed(2)}`, { align: 'left' });
        doc.text(`Order Reference: ${ticketRecord.purchaseCode}`, { align: 'left' });
        doc.moveDown(2);

        // QR Code area
        doc.fontSize(12).text('Scan this code for entry:', { align: 'center' });
        doc.image(qrCodeDataUrl, doc.page.width / 2 - 75, doc.y, { width: 150 });
        doc.moveDown(5);
        
        doc.fontSize(10).fillColor('#6b7280').text('Please keep this PDF safe. Only the first scan of this QR code will grant entry.', { align: 'center' });

        doc.end();
    });
}

// --- 3. MAIN SENDER FUNCTION ---
export const sendTicketEmail = async (purchasedTicket: IPurchasedTicket, email: string) => {
    // 1. Generate the unique QR code data (e.g., encoded ticket ID)
    const uniqueTicketId = purchasedTicket._id.toString(); 
    const qrCodeDataUrl = await generateQrCodeBuffer(uniqueTicketId);

    // 2. Update the purchased ticket record with the QR code identifier
    purchasedTicket.qrCode = uniqueTicketId; 
    await purchasedTicket.save();
    
    // 3. Generate the PDF
    const pdfBuffer = await generateTicketPDF(purchasedTicket, qrCodeDataUrl);

    // 4. Configure and send email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: `Your E-Tickets for ${purchasedTicket.purchaseCode}`,
        html: `
            <h1> Your Tickets Are Ready!</h1>
            <p>Thank you for purchasing ${purchasedTicket.quantity} tickets. You can find your official PDF ticket(s) attached to this email.</p>
            <p>Please present the attached PDF at the event entrance for scanning.</p>
            <p>Event ID: ${purchasedTicket.purchaseCode}</p>
            <br/>
            <p>See you there!</p>
        `,
        attachments: [{
            filename: `tickets_${purchasedTicket.purchaseCode}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    };
    
    await transporter.sendMail(mailOptions);
};