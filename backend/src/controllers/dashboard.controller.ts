import { Request, Response, NextFunction } from "express";
import Event from "../models/event";
import Ticket from "../models/ticket";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { IUser } from "../models/user";
import PurchasedTicket from "../models/PurchasedTicket";

interface AuthRequest extends Request {
  user?: IUser; 
}

export const getDashboardOverview = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  const organizerId = req.user?.id; // from auth middleware

  if (!organizerId) {
    throw new AppError("Unauthorized", 401);
  }

  const organizerEvents = await Event.find({organizerId}).select("_id title date venue price")
  
  const eventIds = organizerEvents.map(event => event._id);
  

  
 // All tickets for events created by organizer for stock tracking
  const allTickets = await Ticket.find({ eventId: { $in: eventIds } });

 

  const confirmedSales = await PurchasedTicket.find({
    eventId: { $in: eventIds },
    status: 'success' 
}).populate({
    path: 'tickets.ticketId',  
    select: 'name price'
  });;


  

  let totalTicketsSold = 0;
  let totalRevenue = 0;

confirmedSales.forEach(order => {
  // NEW STRUCTURE (array of tickets)
  if (Array.isArray(order.tickets) && order.tickets.length > 0) {
    order.tickets.forEach(item => {
      totalTicketsSold += item.quantity;
      totalRevenue += item.quantity * item.price;
    });
  }

 
});




  //  Upcoming events 
  const today = new Date();
   const upcomingEvents = await Event.find({
    organizerId,
    date: { $gte: today }
  })
    .sort({ date: 1 })
    .limit(3);

  // Helper to calculate stock and sales per event for the 'upcomingEvents' list
  const mapEventData = (event: typeof organizerEvents[0]) => {
      const eventTickets = allTickets.filter(t => t.eventId.equals(event._id));
      const eventSales = confirmedSales.filter(s => s.eventId.equals(event._id));

      const ticketsSold = eventSales.reduce((sum, order) => {
            // Check for NEW STRUCTURE 
            if (Array.isArray(order.tickets) && order.tickets.length > 0) {
                // If it's the new array, sum up quantities from all items in the array
           return sum + order.tickets.reduce((itemSum, item) => itemSum + item.quantity, 0);
            }
            
            
            // Default 0 if no sales data is found
            return sum; 
         }, 0);
      
      const ticketsRemaining = eventTickets.reduce((sum, t) => sum + t.remaining, 0);

      return {
          _id: event._id,
          name: event.title,
          date: event.date,
          image: event.image,
          ticketsSold: ticketsSold,
          ticketsRemaining: ticketsRemaining,
      };
  };

  

  // Send response
 res.status(200).json({
  totalEvents: organizerEvents.length,
   totalTicketsSold,
   totalRevenue,
  upcomingEvents: upcomingEvents.map(mapEventData)
  });

});
