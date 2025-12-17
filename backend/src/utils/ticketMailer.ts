// utils/ticketMailer.ts
import { Resend } from 'resend';
import { generateTicketPdf, TicketPdfPayload } from './generateTicketPdf';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketEmail(payloads: TicketPdfPayload[]) {
    
    if (payloads.length === 0) {
        console.warn("Empty array");
        return;
    }

    //  Generate ALL PDF buffers
    const pdfAttachmentPromises = payloads.map(async (payload, index) => {
        const pdfBuffer = await generateTicketPdf(payload);
        
        // Use a unique name for each attachment 
        const filename = `FastTix_${payload.purchaseCode}_${payload.ticketType.replace(/\s/g, '')}_${index + 1}.pdf`;

        return {
            filename: filename,
            content: pdfBuffer.toString('base64'), 
        };
    });

    const attachments = await Promise.all(pdfAttachmentPromises);

    // Use the data from the first payload for email subject/body
    const primaryPayload = payloads[0];
    const totalQuantity = payloads.reduce((sum, p) => sum + p.quantity, 0);

    await resend.emails.send({
        from: 'FastTix Tickets <onboarding@resend.dev>', 
        to: primaryPayload.email,
        subject: `Your ${totalQuantity} Tickets for ${primaryPayload.eventTitle}`,
        html: `
            <h1>Your Tickets Are Ready!</h1>
            <p>Thank you for your purchase, ${primaryPayload.name || 'Customer'}!</p>
            <p><strong>Event:</strong> ${primaryPayload.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(primaryPayload.eventDate).toDateString()}</p>
            <p><strong>Purchase Code:</strong> ${primaryPayload.purchaseCode}</p>
            <br/>
            <p>We have attached ${payloads.length} separate PDF files containing your ${totalQuantity} tickets (one PDF for each ticket type purchased). Please check the attachments below.</p>
            <p>See you at the event!</p>
        `,
        attachments: attachments,
    });
}