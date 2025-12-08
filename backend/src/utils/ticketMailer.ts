// utils/ticketMailer.ts
import { Resend } from 'resend';
import { generateTicketPdf, TicketPdfPayload } from './generateTicketPdf';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketEmail(payload: TicketPdfPayload) {
    const pdfBuffer = await generateTicketPdf(payload);

    await resend.emails.send({
        from: 'FastTix Tickets <onboarding@resend.dev>',  // This works without domain
        to: payload.email,
        subject: `Your Tickets for ${payload.eventTitle}`,
        html: `
            <h1>Your Tickets Are Ready!</h1>
            <p>Thank you for your purchase, ${payload.name || 'Customer'}!</p>
            <p><strong>Event:</strong> ${payload.eventTitle}</p>
            <p><strong>Purchase Code:</strong> ${payload.purchaseCode}</p>
            <br/>
            <p>Your ticket(s) are attached as PDF.</p>
            <p>See you at the event!</p>
        `,
        attachments: [
            {
                filename: `FastTix_${payload.purchaseCode}.pdf`,
                content: pdfBuffer.toString('base64'),  // Resend needs base64
                
            }
        ]
    });
}