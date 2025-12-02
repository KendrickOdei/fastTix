import { Request, Response, NextFunction } from "express";
import Event from "../models/event";
import Ticket from "../models/ticket";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { IUser } from "../models/user";

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

  //  Total events by organizer
  const totalEvents = await Event.countDocuments({ organizerId });

  // 2. All tickets for events created by organizer
  const tickets = await Ticket.find({ organizerId });

  let totalTicketsSold = 0;
  let totalRevenue = 0;

  tickets.forEach((ticket) => {
    const sold = ticket.quantity - ticket.remaining;
    totalTicketsSold += sold;
    totalRevenue += sold * ticket.price;
  });

  // 3. Upcoming events (limit 3)
  const today = new Date();

  const upcomingEvents = await Event.find({
    organizerId,
    date: { $gte: today }
  })
    .sort({ date: 1 })
    .limit(3);

  // Send response
  res.status(200).json({
    totalEvents,
    totalTicketsSold,
    totalRevenue,
    upcomingEvents: upcomingEvents.map((ev: any) => ({
      _id: ev._id ,
      name: ev.title,
      date: ev.date,
      image: ev.image,
      ticketsSold: tickets
        .filter((t) => t.eventId?.toString() === ev._id.toString())
        .reduce((n, t) => n + (t.quantity - t.remaining), 0),
      ticketsRemaining: tickets
        .filter((t) => t.eventId?.toString() === ev._id.toString())
        .reduce((n, t) => n + t.remaining, 0),
    }))
  });

});
