import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import Ticket from '../models/ticket';
import Order from '../models/order';
import * as crypto from "crypto";
import { Types } from "mongoose";
import { IUser } from '../models/user';

interface AuthRequest extends Request {
  user?: IUser;
}


export const initializeTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId, quantity, email } = req.body;
    const userId = req.user?.id || "guest";

    if (!ticketId || !quantity || quantity <= 0 || !email) {
        throw new AppError("Missing required fields", 400);
    }

    const ticket = await Ticket.findById(ticketId).populate("eventId");
    if (!ticket) throw new AppError("Ticket not found", 404);

    if (ticket.remaining < quantity) {
        throw new AppError(`Only ${ticket.remaining} tickets left`, 400);
    }

    const amountPesewas = ticket.price * quantity * 100;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Call Paystack API
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            amount: amountPesewas,
            currency: "GHS",
            callback_url: `${frontendUrl}/payment-success`,
            metadata: {
                userId,
                ticketId,
                eventId: ticket.eventId._id.toString(),
                ticketPrice: ticket.price,
                quantity
            }
        })
    });

    const data = await initRes.json();

    if (!data.status) {
        throw new AppError(data.message || "Failed to initialize transaction", 500);
    }

    res.json({
        message: "Transaction initialized",
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference
    });
});

export const verifyTransactionWebhook = asyncHandler(async (req: Request, res: Response) => {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const signature = req.headers['x-paystack-signature'];

    // Compare hash with header
    const computed = crypto
        .createHmac("sha512", secret)
        .update(req.body)   // RAW BODY
        .digest("hex");

    if (computed !== signature) {
        return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event !== "charge.success") {
        return res.status(200).send("Ignored");
    }

    const reference = event.data.reference;

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            "Authorization": `Bearer ${secret}`
        }
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
        return res.status(200).send("Verification failed");
    }

    const metadata = verifyData.data.metadata;

    const ticketId = metadata.ticketId;
    const eventId = metadata.eventId;
    const ticketPrice = Number(metadata.ticketPrice);
    const quantity = Number(metadata.quantity);
    const userId = metadata.userId;
    const amount = verifyData.data.amount; // Pesewas

    // Final fraud check
    if (amount !== ticketPrice * quantity * 100) {
        return res.status(200).send("Amount mismatch");
    }

    // Update ticket inventory
    await Ticket.findByIdAndUpdate(ticketId, {
        $inc: { sold: quantity, remaining: -quantity }
    });

    // Create Order
    await Order.create({
        user: userId === "guest" ? null : new Types.ObjectId(userId),
        ticket: ticketId,
        event: eventId,
        quantity,
        amountPaid: amount / 100,
        paystackReference: reference,
        status: "paid"
    });

    res.send("OK");
});
