// // src/scripts/retry-all-pending.ts

// import dotenv from 'dotenv';
// dotenv.config();
// import connectDB from '../config/db';
// import mongoose from 'mongoose';


// import User from '../models/user';
// import Event from '../models/event';

// import PurchasedTicket from '../models/PurchasedTicket';
// import Ticket from '../models/ticket';
// import { sendTicketEmail } from '../utils/ticketMailer';


// async function retryAllPendingOrders() {
//     await connectDB();
//     console.log("Connected to DB. Fetching pending orders...");

//     const pendingOrders = await PurchasedTicket.find({ 
//         status: "pending" 
//     }).populate('ticketId');

//     if (pendingOrders.length === 0) {
//         console.log("No pending orders found. All good!");
//         return;
//     }

//     console.log(`Found ${pendingOrders.length} pending orders. Processing...`);

//     for (let i = 0; i < pendingOrders.length; i++) {
//         const order = pendingOrders[i];
//         console.log(`\n[ ${i + 1}/${pendingOrders.length} ] Processing: ${order.purchaseCode}`);

//         try {
//             // 1. Update inventory
//             await Ticket.findByIdAndUpdate(order.ticketId, {
//                 $inc: { sold: order.quantity, remaining: -order.quantity }
//             });
//             console.log("   Inventory updated");

//          const ticketPayloads = purchasedTicket.tickets.map((item) => {
//    // The Ticket and Event details are nested inside item.ticketId due to population
//        const ticketDetails = item.ticketId as any; // Cast for easier access to populated fields
//        const eventDetails = ticketDetails.eventId;

//        return {
//             purchaseCode: purchasedTicket.purchaseCode,
//             eventTitle: eventDetails?.title || 'Event',
//             eventDate: eventDetails?.date || new Date().toISOString(),
//             ticketType: ticketDetails.type || 'Regular',
//             ticketPrice: ticketDetails.price, // Use the specific price for this type
//             quantity: item.quantity, // Use the specific quantity for this type
//             name: purchasedTicket.name || "Valued Customer",
//             email: purchasedTicket.email,
//             venue: eventDetails?.venue || 'Venue',
//             eventImageUrl: eventDetails?.image || undefined
//           }
//       });

//             console.log(`   Sending email to ${order.email}...`);
//             await sendTicketEmail(payload);
//             console.log("   Email sent successfully");

//             // 3. Mark as success
//             order.status = 'success';
//             await order.save();
//             console.log(`   Order ${order.purchaseCode} → SUCCESS\n`);

//         } catch (error: any) {
//             console.error(`   FAILED for ${order.purchaseCode}:`, error.message);
//             console.error("   Will skip and continue...\n");
//         }
//     }

//     console.log("All done! Check your email inboxes.");
//     await mongoose.disconnect();
// }

// retryAllPendingOrders().catch(err => {
//     console.error("Script crashed:", err);
//     process.exit(1);
// });