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

export async function generateTicketPdf(
  payload: TicketPdfPayload
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 36,
      });

      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);

      doc.pipe(stream);

      const contentWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

      /* ================= HEADER IMAGE ================= */
      if (payload.eventImageUrl) {
        const imageBuffer = await fetchImageBuffer(payload.eventImageUrl);
        if (imageBuffer) {
          doc.image(imageBuffer, {
            fit: [contentWidth, 140],
            align: "center",
          });
          doc.moveDown(1);
        }
      }

      /* ================= EVENT TITLE ================= */
      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#111827")
        .text(payload.eventTitle);

      doc.moveDown(0.6);

      // ticket type pill
      const pillWidth = 240;
      const pillHeight = 36;
      const pillX = doc.x;
      const pillY = doc.y;

      doc
        .roundedRect(pillX, pillY, pillWidth, pillHeight, 18)
        .fill("#0ea5a9");

      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
          `${payload.ticketType.toUpperCase()} • GHS ${payload.ticketPrice}`,
          pillX,
          pillY + 10,
          {
            width: pillWidth,
            align: "center",
          }
        );

      doc.moveDown(1.5);

      // quantity
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#374151")
        .text(`Quantity: ${payload.quantity}`);

      doc.moveDown(1);

      // date and venue
      const holderBoxY = doc.y;

      doc
        .roundedRect(doc.x, holderBoxY, contentWidth, 60, 8)
        .fill("#f3f4f6");

      doc
        .fillColor("#6b7280")
        .fontSize(10)
        .font("Helvetica")
        .text("Ticket Holder", doc.x + 12, holderBoxY + 8);

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#111827")
        .text(payload.name, doc.x + 12, holderBoxY + 24);

      doc.moveDown(3);

        // date and venue
      const leftColX = doc.x;
      const colWidth = contentWidth / 2 - 10;
      const rightColX = leftColX + colWidth + 20;

      const eventDate = new Date(payload.eventDate);

      const dateStr = eventDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const timeStr = eventDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#6b7280")
        .text("Date & Time", leftColX);

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#111827")
        .text(`${dateStr} • ${timeStr}`, leftColX, doc.y + 18);

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#6b7280")
        .text("Venue", rightColX, doc.y - 18);

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#111827")
        .text(payload.venue, rightColX);

      doc.moveDown(6);

      // qr code
      const qrContainerSize = 330;
      const qrX = doc.page.width / 2 - qrContainerSize / 2;
      const qrY = doc.y;

      doc
        .save()
        .lineWidth(2)
        .dash(6, { space: 6 })
        .roundedRect(qrX, qrY, qrContainerSize, qrContainerSize, 12)
        .stroke("#d1d5db")
        .restore();

      const qrBuffer = await generateQrPngBuffer(payload.purchaseCode);

      const qrSize = qrContainerSize - 40;
      doc.image(qrBuffer, qrX + 20, qrY + 20, {
        fit: [qrSize, qrSize],
      });

// Manually move cursor BELOW QR container
       doc.y = qrY + qrContainerSize + 24;
      //purchase code
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#111827")
        .text(`Purchase Code: ${payload.purchaseCode}`, {
          align: "center",
        });

      doc.moveDown(1.5);

      // footer
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#6b7280")
        .text(
          "Present this ticket (digital or printed) at the venue entrance. Tickets are non-transferable.",
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
