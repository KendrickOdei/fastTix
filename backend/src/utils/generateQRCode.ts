import QRCode  from "qrcode";

export async function
generateQrPngBuffer(text: string): Promise<Buffer> {
    const opts = {
        errorCorrectionLevel: "H" as const,
        type: "png" as const,
        margin: 1,
        width: 700
    };
    const buffer = await
     QRCode.toBuffer(text, opts);
     return buffer;

}