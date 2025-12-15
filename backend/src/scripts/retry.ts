// src/scripts/retry-all-pending.ts

import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db';
import mongoose from 'mongoose';


import User from '../models/user';
import Event from '../models/event';

import PurchasedTicket from '../models/PurchasedTicket';
import Ticket from '../models/ticket';
import { sendTicketEmail } from '../utils/ticketMailer';


async function retryAllPendingOrders() {
    await connectDB();
    console.log("Connected to DB. Fetching pending orders...");

    const pendingOrders = await PurchasedTicket.find({ 
        status: "pending" 
    }).populate('ticketId');

    if (pendingOrders.length === 0) {
        console.log("No pending orders found. All good!");
        return;
    }

    console.log(`Found ${pendingOrders.length} pending orders. Processing...`);

    for (let i = 0; i < pendingOrders.length; i++) {
        const order = pendingOrders[i];
        console.log(`\n[ ${i + 1}/${pendingOrders.length} ] Processing: ${order.purchaseCode}`);

        try {
            // 1. Update inventory
            await Ticket.findByIdAndUpdate(order.ticketId, {
                $inc: { sold: order.quantity, remaining: -order.quantity }
            });
            console.log("   Inventory updated");

            // 2. Generate & send PDF ticket
            const payload = {
                purchaseCode: order.purchaseCode,
                eventTitle: (order.eventId as any)?.title || 'Event',
                eventDate: (order.eventId as any)?.date || new Date(),
                ticketType: (order.ticketId as any)?.type || 'Regular',
                ticketPrice: order.totalAmount / order.quantity,
                quantity: order.quantity,
                name: order.name || "Valued Customer",
                email: order.email,
                venue: (order.eventId as any)?.venue || 'TBD',
                eventImageUrl: (order.eventId as any)?.image || undefined
            };

            console.log(`   Sending email to ${order.email}...`);
            await sendTicketEmail(payload);
            console.log("   Email sent successfully");

            // 3. Mark as success
            order.status = 'success';
            await order.save();
            console.log(`   Order ${order.purchaseCode} → SUCCESS\n`);

        } catch (error: any) {
            console.error(`   FAILED for ${order.purchaseCode}:`, error.message);
            console.error("   Will skip and continue...\n");
        }
    }

    console.log("All done! Check your email inboxes.");
    await mongoose.disconnect();
}

retryAllPendingOrders().catch(err => {
    console.error("Script crashed:", err);
    process.exit(1);
});