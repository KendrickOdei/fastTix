// utils/ticketMailer.ts
import nodemailer from 'nodemailer';
import { generateTicketPdf, TicketPdfPayload } from './generateTicketPdf';

export async function sendTicketEmail(payloads: TicketPdfPayload[]) {
    
    if (payloads.length === 0) {
        console.warn("Empty array");
        return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Generate ALL PDF buffers
    const pdfAttachmentPromises = payloads.map(async (payload, index) => {
        const pdfBuffer = await generateTicketPdf(payload);
        
        // Use a unique name for each attachment 
        const filename = `FastTix_${payload.purchaseCode}_${payload.ticketType.replace(/\s/g, '')}_${index + 1}.pdf`;

        return {
            filename: filename,
            content: pdfBuffer, // Nodemailer accepts Buffer directly
            contentType: 'application/pdf'
        };
    });

    const attachments = await Promise.all(pdfAttachmentPromises);

    // Use the data from the first payload for email subject/body
    const primaryPayload = payloads[0];
    const totalQuantity = payloads.reduce((sum, p) => sum + p.quantity, 0);

    const mailOptions = {
        from: `FastTix Tickets <${process.env.SMTP_USER}>`,
        to: primaryPayload.email,
        subject: `Your ${totalQuantity} Ticket${totalQuantity > 1 ? 's' : ''} for ${primaryPayload.eventTitle}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
                    .ticket-info p { margin: 10px 0; }
                    .ticket-info strong { color: #16a34a; }
                    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
                    .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">🎟️ Your Tickets Are Ready!</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px;">Hi ${primaryPayload.name || 'Customer'},</p>
                        <p>Thank you for your purchase! Your tickets are attached to this email.</p>
                        
                        <div class="ticket-info">
                            <p><strong>Event:</strong> ${primaryPayload.eventTitle}</p>
                            <p><strong>Date:</strong> ${new Date(primaryPayload.eventDate).toDateString()}</p>
                            <p><strong>Purchase Code:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${primaryPayload.purchaseCode}</code></p>
                            <p><strong>Total Tickets:</strong> ${totalQuantity}</p>
                        </div>

                        <p><strong>📎 Attachments:</strong> We have attached ${payloads.length} PDF file${payloads.length > 1 ? 's' : ''} containing your ${totalQuantity} ticket${totalQuantity > 1 ? 's' : ''} ${payloads.length > 1 ? '(one PDF for each ticket type)' : ''}.</p>
                        
                        <p style="margin-top: 20px;"><strong>Important:</strong></p>
                        <ul style="color: #6b7280;">
                            <li>Please download and save your tickets</li>
                            <li>Present the QR code at the venue entrance</li>
                            <li>Each ticket can only be scanned once</li>
                            <li>Arrive early to avoid queues</li>
                        </ul>

                        <div style="text-align: center;">
                            <p style="font-size: 18px; color: #16a34a; font-weight: bold; margin-top: 30px;">See you at the event! 🎉</p>
                        </div>

                        <div class="footer">
                            <p>This is an automated email from FastTix. Please do not reply.</p>
                            <p>If you have any questions, contact us at support@fasttix.com</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket email sent successfully to ${primaryPayload.email}`);
}

// // utils/ticketMailer.ts
// import { Resend } from 'resend';
// import { generateTicketPdf, TicketPdfPayload } from './generateTicketPdf';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendTicketEmail(payloads: TicketPdfPayload[]) {
    
//     if (payloads.length === 0) {
//         console.warn("Empty array");
//         return;
//     }

//     //  Generate ALL PDF buffers
//     const pdfAttachmentPromises = payloads.map(async (payload, index) => {
//         const pdfBuffer = await generateTicketPdf(payload);
        
//         // Use a unique name for each attachment 
//         const filename = `FastTix_${payload.purchaseCode}_${payload.ticketType.replace(/\s/g, '')}_${index + 1}.pdf`;

//         return {
//             filename: filename,
//             content: pdfBuffer.toString('base64'), 
//         };
//     });

//     const attachments = await Promise.all(pdfAttachmentPromises);

//     // Use the data from the first payload for email subject/body
//     const primaryPayload = payloads[0];
//     const totalQuantity = payloads.reduce((sum, p) => sum + p.quantity, 0);

//     await resend.emails.send({
//         from: 'FastTix Tickets <onboarding@resend.dev>', 
//         to: primaryPayload.email,
//         subject: `Your ${totalQuantity} Tickets for ${primaryPayload.eventTitle}`,
//         html: `
//             <h1>Your Tickets Are Ready!</h1>
//             <p>Thank you for your purchase, ${primaryPayload.name || 'Customer'}!</p>
//             <p><strong>Event:</strong> ${primaryPayload.eventTitle}</p>
//             <p><strong>Date:</strong> ${new Date(primaryPayload.eventDate).toDateString()}</p>
//             <p><strong>Purchase Code:</strong> ${primaryPayload.purchaseCode}</p>
//             <br/>
//             <p>We have attached ${payloads.length} separate PDF files containing your ${totalQuantity} tickets (one PDF for each ticket type purchased). Please check the attachments below.</p>
//             <p>See you at the event!</p>
//         `,
//         attachments: attachments,
//     });
// }

// twilio = LYPQ7LLQXY5MH7S7KZ2XWX1Z