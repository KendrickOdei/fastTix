import PDFDocument from "pdfkit"; // 1. REVERTED TO DEFAULT IMPORT for the constructor value
import { PassThrough } from "stream";
import { fetchImageBuffer } from "./fetchImageBuffer";
import { generateQrPngBuffer } from "./generateQRCode";
import { format } from "date-fns"; 

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

// --- Drawing Constants for the Ticket Block ---
const TICKET_WIDTH = 380; 
const TICKET_HEIGHT = 650;
const TICKET_RADIUS = 16;
const TICKET_X = (595.28 - TICKET_WIDTH) / 2;

/**
 * Defines the fixed color palette, removing conditional logic.
 */
function getTicketFillColor() {
    return {
        // Main brand color (Blue for badges/highlights)
        primary: "#2563eb", // blue-600
        // Light background for info boxes
        secondary: "#e0f2fe", // light blue for backgrounds
        // Dark text color
        text: "#1f2937", 
        // Lighter gray for labels/instructions
        lightText: "#6b7280" 
    }
}


export async function generateTicketPdf(
  payload: TicketPdfPayload
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      // 1. Setup Document
      const doc = new PDFDocument({ // Uses the default imported constructor
        size: "A4",
        margin: 0, 
      });

      const stream = new PassThrough();

      
      const chunks: Buffer[] = [];

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);

      doc.pipe(stream);
      
      const colors = getTicketFillColor();
      const initialY = 60; 

      /* ================= TICKET DRAWING LOOP (Creates a stack effect) ================= */
      
      const ticketsToDraw = Math.min(payload.quantity, 3); 

      for (let i = ticketsToDraw - 1; i >= 0; i--) { 
          const currentY = initialY + i * 10;
          const opacity = i === 0 ? 1 : 1 - (i * 0.2); 

          // TICKET BACKGROUND BOX
          doc
            .save()
            .fillColor("#ffffff")
            .roundedRect(TICKET_X, currentY, TICKET_WIDTH, TICKET_HEIGHT, TICKET_RADIUS)
            .fillOpacity(opacity)
            .fill()
            .strokeOpacity(opacity)
            .lineWidth(1)
            .stroke("#d1d5db")
            .restore();

          // We only draw detailed content on the topmost ticket (i=0)
          if (i === 0) {
              await drawTicketContent(doc, payload, TICKET_X, currentY, TICKET_WIDTH, TICKET_HEIGHT, colors);
          }
      }

      /* ================= END TICKET DRAWING LOOP ================= */

      doc.y = initialY + TICKET_HEIGHT + 30;
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Helper function to draw all content onto a single ticket block.
 * Uses the ticket's container coordinates (x, y, width, height) for relative positioning.
 */
async function drawTicketContent(
    doc: typeof PDFDocument.prototype, // 2. CORRECTED TYPE: Use typeof [Constructor].prototype
    payload: TicketPdfPayload, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    colors: ReturnType<typeof getTicketFillColor>
) {
    const PADDING = 24;
    let currentY = y + PADDING;
    const contentWidth = width - 2 * PADDING;
    
    // --- 1. HEADER IMAGE ---
    const imageHeight = 120;
    if (payload.eventImageUrl) {
      const imageBuffer = await fetchImageBuffer(payload.eventImageUrl);
      if (imageBuffer) {
        doc.save();
        doc.roundedRect(x + PADDING, currentY, contentWidth, imageHeight, 8).clip();
        doc.image(imageBuffer, x + PADDING, currentY, {
          fit: [contentWidth, imageHeight],
          align: "center",
          valign: "center"
        });
        doc.restore();
      }
    } else {
        doc.roundedRect(x + PADDING, currentY, contentWidth, imageHeight, 8).fill("#f3f4f6");
        doc.fillColor(colors.lightText).fontSize(14).text("Event Image Missing", x + PADDING, currentY + 50, { width: contentWidth, align: "center" });
    }
    currentY += imageHeight + 20; 

    
    // --- 2. EVENT TITLE ---
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor(colors.text)
      .text(payload.eventTitle, x + PADDING, currentY, { width: contentWidth });
    
    currentY = doc.y + 12;

    // --- 3. TICKET TYPE BADGE ---
    const badgeText = `${payload.ticketType.toUpperCase()} ${payload.quantity > 1 ? `(${payload.quantity} Tickets)` : ''} • GHS ${payload.ticketPrice.toFixed(2)}`;
    const badgeHeight = 30;
    const badgeRadius = 15;
    const badgeWidth = doc.widthOfString(badgeText) + 30;

    doc
      .roundedRect(x + PADDING, currentY, badgeWidth, badgeHeight, badgeRadius)
      .fill(colors.primary);

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        badgeText,
        x + PADDING,
        currentY + 10,
        {
          width: badgeWidth,
          align: "center",
        }
      );
    currentY += badgeHeight + 20;

    // --- 4. TICKET HOLDER & REFERENCE BOX ---
    const holderBoxHeight = 60;
    doc
      .roundedRect(x + PADDING, currentY, contentWidth, holderBoxHeight, 8)
      .fill(colors.secondary);

    // Holder Name
    doc
      .fillColor(colors.lightText)
      .fontSize(10)
      .font("Helvetica")
      .text("Ticket Holder", x + PADDING + 12, currentY + 8);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(colors.text)
      .text(payload.name, x + PADDING + 12, currentY + 24);
      
    // Purchase Code
    doc
      .fillColor(colors.lightText)
      .fontSize(10)
      .font("Helvetica")
      .text("Purchase Reference", x + PADDING + contentWidth/2 + 12, currentY + 8);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(colors.text)
      .text(payload.purchaseCode, x + PADDING + contentWidth/2 + 12, currentY + 24);

    currentY += holderBoxHeight + 20;


    // --- 5. DATE & VENUE (Two Columns) ---
    const colWidth = contentWidth / 2;
    const rightColX = x + PADDING + colWidth;
    const eventDate = new Date(payload.eventDate);
    
    const dateStr = format(eventDate, "EEE, MMM d, yyyy");
    const timeStr = format(eventDate, "h:mm a");
    
    // Column 1: Date & Time
    doc.fillColor(colors.lightText).fontSize(10).font("Helvetica").text("Date & Time", x + PADDING, currentY);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.text).text(`${dateStr}`, x + PADDING);
    doc.font("Helvetica").fontSize(12).text(`${timeStr}`, x + PADDING);

    // Column 2: Venue
    const venueY = currentY;
    doc.fillColor(colors.lightText).fontSize(10).font("Helvetica").text("Venue", rightColX, venueY);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.text).text(payload.venue, rightColX);

    currentY = doc.y + 20;


    // --- 6. QR CODE ---
    const qrSize = 150;
    const qrX = x + width / 2 - qrSize / 2;
    const qrY = currentY;

    // Dashed Border
    doc
      .save()
      .lineWidth(2)
      .dash(4, { space: 4 })
      .roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12)
      .stroke("#d1d5db")
      .restore();

    const qrData = payload.purchaseCode;
    const qrBuffer = await generateQrPngBuffer(qrData);

    doc.image(qrBuffer, qrX, qrY, {
      fit: [qrSize, qrSize],
    });

    currentY += qrSize + 30;
    
    // --- 7. FOOTER / INSTRUCTIONS ---
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(colors.lightText)
      .text(
        "Present this ticket (digital or printed) at the venue entrance. Tickets are non-transferable.",
        x + PADDING,
        currentY,
        { 
            width: contentWidth, 
            align: "center" 
        }
      );
}