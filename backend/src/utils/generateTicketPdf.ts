

import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { fetchImageBuffer } from "./fetchImageBuffer";
import { generateQrPngBuffer } from "./generateQRCode";

export interface TicketPdfPayload {
  purchaseCode: string;
  eventTitle: string;
  eventDate: string; // ISO string
  ticketType: string; 
  ticketPrice: number; 
  quantity: number;
  name: string;
  email: string;
  venue: string;
  eventImageUrl?: string; 
}


export async function generateTicketPdf(payload: TicketPdfPayload): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 36
      });

      const stream = new PassThrough();
      const chunks: Buffer[] = [];
      stream.on("data", (c) => chunks.push(c));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", (e) => reject(e));

      doc.pipe(stream);

      // Header image (cover)
      if (payload.eventImageUrl) {
        const imgBuf = await fetchImageBuffer(payload.eventImageUrl);
        if (imgBuf) {
          // Fit to page width minus margins
          const imgHeight = 140;
          doc.image(imgBuf, { fit: [doc.page.width - doc.page.margins.left - doc.page.margins.right, imgHeight], align: "center" });
        } else {
          // if no header image, put event title big
          doc
            .rect(doc.page.margins.left, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 120)
            .fill("#f3f4f6");
          doc.fillColor("#111827");
        }
      }

      doc.moveDown(1.2);

      // Event Title big
      doc.fontSize(28).fillColor("#111827").font("Helvetica-Bold").text(payload.eventTitle, {
        align: "left"
      });

      doc.moveDown(0.6);

      // Blue pill for ticket type + price (draw rounded rect)
      const pillWidth = 220;
      const pillHeight = 36;
      const startX = doc.x;
      const startY = doc.y;
      // Draw pill gradient-like (solid blue fill)
      doc.roundedRect(startX, startY, pillWidth, pillHeight, 18).fill("#0ea5a9"); // teal-ish
      // Text inside pill
      doc
        .fillColor("#fff")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${payload.ticketType.toUpperCase()} • GHS ${payload.ticketPrice}`, startX + 12, startY + 8, {
          width: pillWidth - 24,
          align: "center"
        });
      doc.moveDown(2);

      // Ticket Holder box
      const boxY = doc.y;
      doc.roundedRect(doc.x, boxY, doc.page.width - doc.page.margins.left - doc.page.margins.right, 60, 8).fill("#f3f4f6");
      doc.fillColor("#111827").fontSize(10).font("Helvetica").text("Ticket Holder", doc.x + 12, boxY + 8);
      doc.font("Helvetica-Bold").fontSize(16).text(payload.name, doc.x + 12, boxY + 24);
      doc.moveDown(3);

      // Date & Time and Venue columns
      const leftColX = doc.x;
      const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2 - 10;
      const rightColX = leftColX + colWidth + 20;
      // Left: Date & Time
      const readableDate = new Date(payload.eventDate);
      const dateStr = readableDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      const timeStr = readableDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      doc.fontSize(11).fillColor("#6b7280").font("Helvetica").text("Date & Time", leftColX, doc.y, { continued: false });
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text(`${dateStr} • ${timeStr}`, leftColX, doc.y + 18);

      // Right: Venue
      doc.font("Helvetica").fontSize(11).fillColor("#6b7280").text("Venue", rightColX, doc.y - 18);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text(payload.venue, rightColX, doc.y - 0);

      doc.moveDown(6);

      // QR area: dashed rounded rect
      const qrContainerSize = 330;
      const centerX = doc.page.width / 2 - qrContainerSize / 2;
      const qrY = doc.y;
      // dashed border: draw with small dashes
      const borderX = centerX;
      const borderY = qrY;
      const r = 12;
      doc.save();
      doc.lineWidth(2).dash(6, { space: 6 }).roundedRect(borderX, borderY, qrContainerSize, qrContainerSize, r).stroke("#d1d5db");
      doc.undash();
      doc.restore();

      // Generate QR buffer and embed it centered
      const qrBuf = await generateQrPngBuffer(payload.purchaseCode);
      const qrSize = qrContainerSize - 40; // padding inside dashed border
      const qrX = centerX + (qrContainerSize - qrSize) / 2;
      const qrXScaled = qrX;
      const qrYScaled = borderY + 20;

      doc.image(qrBuf, qrXScaled, qrYScaled, { fit: [qrSize, qrSize], align: "center" });

      // Under QR show purchase code
      const underY = borderY + qrContainerSize + 12;
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(`Purchase Code: ${payload.purchaseCode}`, { align: "center", baseline: "middle" });

      // Footer small note
      doc.moveDown(2);
      doc.fontSize(10).font("Helvetica").fillColor("#6b7280").text("Present this PDF (digital or printed) at the venue entrance. Tickets are non-transferable.", {
        align: "center"
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}