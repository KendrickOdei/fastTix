import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import Ticket from '../models/ticket';
import * as crypto from "crypto";

import { IUser } from '../models/user';
import PurchasedTicket from '../models/PurchasedTicket';
import { sendTicketEmail } from '../utils/ticketMailer';

interface AuthRequest extends Request {
  user?: IUser;
}

export const checkOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { ref } = req.query;

    if (!ref || typeof ref !== 'string') {
        return res.status(400).json({ message: 'Missing transaction reference.' });
    }

    //  Find the purchased ticket record
    const ticketRecord = await PurchasedTicket.findOne({ purchaseCode: ref })
        .populate('eventId', 'title date') 
        .select('purchaseCode quantity totalAmount eventId qrCode'); 

    if (!ticketRecord) {
        
        return res.status(404).json({ status: 'not_found', message: 'Order reference not recognized.' });
    }

    //  Determine the final status for the frontend
    let status: 'success' | 'pending' | 'failed';
    let message: string;

    if (ticketRecord.qrCode) {
       
        status = 'success';
        message = 'Payment confirmed and tickets have been emailed!';
    } else {
        
        status = 'pending'; 
        message = 'Payment successful, but ticket generation is pending. Please check your email in a few minutes.';
    }

    res.json({
        status: status,
        message: message,
        data: {
            reference: ticketRecord.purchaseCode,
            quantity: ticketRecord.quantity,
            amount: ticketRecord.totalAmount,
            eventTitle: (ticketRecord.eventId as any)?.title,
            eventDate: (ticketRecord.eventId as any)?.date,
        }
    });
});


export const initializeTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId, quantity, email } = req.body;
    const userId = req.user?.id || null;

    if (!ticketId || !quantity || quantity <= 0 || !email) {
        throw new AppError("Missing required fields", 400);
    }

    const ticket = await Ticket.findById(ticketId).populate("eventId");
    if (!ticket) throw new AppError("Ticket not found", 404);

    if (ticket.remaining < quantity) {
        throw new AppError(`Only ${ticket.remaining} tickets left`, 400);
    }

    const totalAmount = ticket.price * quantity 
    const amountInKobo = totalAmount * 100

    const purchaseCode = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const pendingTicket = await PurchasedTicket.create({
        userId,
        eventId: ticket.eventId,
        ticketId: ticketId,
        quantity: quantity,
        totalAmount: totalAmount,
        purchaseCode: purchaseCode, 
        qrCode: '', 
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Call Paystack API
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            amount: amountInKobo,
            currency: "GHS",
            reference: purchaseCode,
            callback_url: `${frontendUrl}/payment-success`,
            metadata: {
            order_id: pendingTicket._id, 
            custom_fields: [{
                display_name: "Ticket Type",
                variable_name: "ticket_type",
                value: ticket.name,
            }],
        },
        })
    });

    const data = await paystackResponse.json();

    if (!data.status) {
        throw new AppError(data.message || "Failed to initialize transaction", 500);
    }

    res.json({
        message: "Transaction initialized",
        authorizationUrl: data.data.authorization_url,
        reference: purchaseCode,
    });
});





export const verifyTransactionWebhook = asyncHandler(async (req: Request, res: Response) => {
    
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const signature = req.headers['x-paystack-signature'];
    
    
    const computed = crypto
        .createHmac("sha512", secret)
        .update(req.body) 
        .digest("hex");

    if (computed !== signature) {
        
        return res.status(400).send("Invalid signature"); 
    }

   
    const event = JSON.parse(req.body.toString()); // Parse after verification

    if (event.event !== "charge.success") {
        return res.status(200).send("Ignored");
    }

    const reference = event.data.reference;

    
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            "Authorization": `Bearer ${secret}`
        }
    });

    const verifyData = await verifyRes.json();
    
    // Check if verification failed
    if (!verifyData.status || verifyData.data.status !== "success") {
        return res.status(200).send("Verification failed");
    }

    const { amount, metadata, customer } = verifyData.data;

    
    const purchasedTicket = await PurchasedTicket.findOne({ purchaseCode: reference });

    //  Order must exist in our DB
    if (!purchasedTicket) {
        console.error(`Webhook Error: PurchasedTicket order not found for reference ${reference}`);
        return res.status(200).send("Order not found, acknowledged."); 
    }
    
    // Check 4b: Prevent double processing
    if (purchasedTicket.qrCode !== "") { // We use the presence of qrCode as a fulfillment flag
        console.warn(`Webhook: Duplicate charge.success event for ${reference}. Already fulfilled.`);
        return res.status(200).send("Already fulfilled.");
    }

    // Final Price Validation
    const expectedAmount = purchasedTicket.totalAmount * 100; // Total amount in Pesewas
    if (amount !== expectedAmount) {
        
         console.error(`Fraud Alert: Amount mismatch! Expected ${expectedAmount}, received ${amount}`);
         return res.status(200).send("Amount mismatch, fulfillment halted."); 
    }
    
    
    const quantity = purchasedTicket.quantity;

    
    await Ticket.findByIdAndUpdate(purchasedTicket.ticketId, {
        $inc: { sold: quantity, remaining: -quantity }
    });

   
    try {
        await sendTicketEmail(purchasedTicket, customer.email); 
        console.log(`ATTEMPTING TICKET FULFILLMENT for ${purchasedTicket.purchaseCode}`);
        console.log(`Fulfillment successful for order ${reference}`);
    } catch (err) {
        console.error(`TICKET FULFILLMENT FAILED for ${reference}:`, err);
        
    }
    
    
    res.status(200).send("OK");
});