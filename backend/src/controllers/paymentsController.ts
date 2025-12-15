import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import Ticket from '../models/ticket';
import * as crypto from "crypto";

import User, { IUser } from '../models/user';
import PurchasedTicket from '../models/PurchasedTicket';
import { sendTicketEmail } from '../utils/ticketMailer';
import { generatePurchaseCode } from '../utils/generateReference';

interface AuthRequest extends Request {
  user?: IUser;
}

interface TicketItem {
  ticketId: string;
  quantity: number;
}

interface InitializePayload {
  tickets: TicketItem[];  // ← NOW AN ARRAY
  email: string;
  name: string;
}

export const initializeTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { tickets, email, name } = req.body as InitializePayload;
    const userId = req.user?.id || null;

    if (!tickets || tickets.length === 0 || !email || !name) {
        throw new AppError("Missing required fields", 400);
    }

    let totalAmount = 0;
    const ticketDetails = [];

    for (const item of tickets) {
        const ticket = await Ticket.findById(item.ticketId).populate("eventId");
        if (!ticket) throw new AppError(`Ticket ${item.ticketId} not found`, 404);
        if (ticket.remaining < item.quantity) {
            throw new AppError(`Only ${ticket.remaining} ${ticket.type} tickets left`, 400);
        }

    const amount = ticket.price * item.quantity 
    totalAmount += amount;

    

    ticketDetails.push({
            ticketId: ticket._id,
            quantity: item.quantity,
            price: ticket.price,
            type: ticket.type,
        });
    }

    const amountInKobo = Math.round(totalAmount * 100);
    const purchaseCode = generatePurchaseCode()

    const pendingTicket = await PurchasedTicket.create({
        userId,
        email,
        eventId: (await Ticket.findById(tickets[0].ticketId))?.eventId,
        name,
        totalAmount: totalAmount,
        purchaseCode: purchaseCode, 
        status: "pending",
        qrCode: '',
        tickets: ticketDetails.map(t => ({
            ticketId: t.ticketId,
            quantity: t.quantity,
            price: t.price,
        }))
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
            name,
            amount: amountInKobo,
            currency: "GHS",
            reference: purchaseCode,
            callback_url: `${frontendUrl}/payment-success?reference=${purchaseCode}`,
            metadata: {
            order_id: pendingTicket._id.toString(), 

          
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
    
    console.log("webhook received", req.body)
    console.log("webhook received from paystack")
     
    const signature = req.headers['x-paystack-signature'];
    
    
    const computed = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
        .update(req.body)
        .digest("hex");

        console.log(computed)

    if (computed !== signature) {
        
        return res.status(400).send("Invalid signature"); 
    }

    

   
    const event = JSON.parse(req.body)

    if (event.event !== "charge.success") {
        return res.status(200).send("Ignored");
    }

    const reference = event.data.reference;

    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            "Authorization": `Bearer ${secret}`
        }
    });

    const verifyData = await verifyRes.json();

    console.log('verify data', verifyData)
    
    // Check if verification failed
    if (!verifyData.status || verifyData.data.status !== "success") {
        return res.status(200).send("Verification failed");
    }

    

    
    const purchasedTicket = await PurchasedTicket.findOne({ purchaseCode: reference }).populate({
                                                                                         path: 'tickets.ticketId',
                                                                                         select: 'type price eventId', // Get only necessary fields from the Ticket model
                                                                                          populate: {
                                                                                         path: 'eventId', // Then populate the Event details from the Ticket
                                                                                          select: 'title date venue image',
                                                                                            }
                                                                                          })
                                                                                       
                                                                                           

    //  Order must exist in our DB
    if (!purchasedTicket) {
        return res.status(200).send("Order not found"); 
    }
    
    //  Prevent double processing
    if (purchasedTicket.status === "success") {
        return res.status(200).send("Already fulfilled.");
    }

    // Final Price Validation
    const amount = event.data.amount
    const expectedAmount = purchasedTicket.totalAmount * 100; // Total amount in Pesewas
    if (amount !== expectedAmount) {
        
         console.error(`Fraud Alert: Amount mismatch! Expected ${expectedAmount}, received ${amount}`);
         return res.status(200).send("Amount mismatch, fulfillment halted."); 
    }
    
  
for (const item of purchasedTicket.tickets) {
      await Ticket.findByIdAndUpdate(item.ticketId, {
        $inc: { 
          sold: item.quantity, 
          remaining: -item.quantity 
        }
      });
    }
  
  
  try {
      const ticketPayloads = purchasedTicket.tickets.map((item) => {
   // The Ticket and Event details are nested inside item.ticketId due to population
       const ticketDetails = item.ticketId as any; // Cast for easier access to populated fields
       const eventDetails = ticketDetails.eventId;

       return {
            purchaseCode: purchasedTicket.purchaseCode,
            eventTitle: eventDetails?.title || 'Event',
            eventDate: eventDetails?.date || new Date().toISOString(),
            ticketType: ticketDetails.type || 'Regular',
            ticketPrice: ticketDetails.price, // Use the specific price for this type
            quantity: item.quantity, // Use the specific quantity for this type
            name: purchasedTicket.name || "Valued Customer",
            email: purchasedTicket.email,
            venue: eventDetails?.venue || 'Venue',
            eventImageUrl: eventDetails?.image || undefined
          }
      });
    await sendTicketEmail(ticketPayloads)

    purchasedTicket.status = 'success';

    await purchasedTicket.save()
    console.log(`Ticket email sent for order ${reference}`)
  } catch (error) {
    console.error("Failed to send ticket to email", error)
  }
    
    
    res.status(200).send("OK");
});


export const checkOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { ref } = req.query;

    if (!ref || typeof ref !== 'string') {
        return res.status(400).json({ message: 'Missing transaction reference.' });
    }

    //  find the purchased ticket record
    const ticketRecord = await PurchasedTicket.findOne({ purchaseCode: ref })
        .populate('eventId', 'title date') 
        .select('purchaseCode quantity totalAmount eventId qrCode status'); 

    if (!ticketRecord) {
        
        return res.status(404).json({ status: 'not_found', message: 'Order reference not recognized.' });
    }

    //  Determine the final status for the frontend
    const totalQty = ticketRecord.tickets.reduce((sum, t) => sum + t.quantity, 0);
    

    if (ticketRecord.status === 'success') {
        return res.json({
            status: 'success',
            message: 'Payment confirmed and tickets have been emailed!',
            data: {
                reference: ticketRecord.purchaseCode,
                quantity: totalQty,
                amount: ticketRecord.totalAmount,
                eventTitle: (ticketRecord.eventId as any)?.title || 'Event',
                eventDate: (ticketRecord.eventId as any)?.date || new Date(),
            }
        });
    }

   return res.json({
        status: 'pending',
        message: 'We are generating your tickets right now. This takes 5-15 seconds.',
        data: {
            reference: ticketRecord.purchaseCode,
            quantity: totalQty,
            amount: ticketRecord.totalAmount,
            eventTitle: (ticketRecord.eventId as any)?.title || 'Event',
            eventDate: (ticketRecord.eventId as any)?.date || new Date(),
        }
    });
});
