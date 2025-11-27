import { asyncHandler } from "../utils/asyncHandler";
import Ticket from "../models/ticket";
import PurchasedTicket from "../models/PurchasedTicket";
import { AppError } from "../utils/AppError";
import { IUser } from "../models/user";
import { Request, Response, NextFunction } from "express";

interface PurchaseRequestBody {
  ticketId: string;
  quantity: number;
}

interface AuthRequest extends Request<{}, {}, PurchaseRequestBody> {
  user?: IUser;
}

export const createPurchase = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { ticketId, quantity } = req.body;
    const userId = req.user?.id;

    const ticketType = await Ticket.findById(ticketId);
    if (!ticketType) throw new AppError("Ticket type not found", 404);

    if (ticketType.remaining < quantity) {
      throw new AppError(`Only ${ticketType.remaining} tickets left!`, 400);
    }

    ticketType.sold += quantity;
    ticketType.remaining -= quantity; // decrease remaining

    await ticketType.save();

    // create purchase record
    const purchase = await PurchasedTicket.create({
      userId,
      eventId: ticketType.eventId,
      ticketId,
      quantity,
      totalAmount: ticketType.price * quantity,
      purchaseCode: `FTX-${Date.now()}-${Math.random().toString(36).substr(2,5).toUpperCase()}`,
      qrCode: `https://fasttix.com/verify/${Date.now()}-${userId}`,
    });

    const populated = await purchase.populate([
      { path: "ticketId", select: "name price" },
      { path: "eventId", select: "title date venue image" },
    ]);

    res.status(201).json({
      success: true,
      message: "Ticket purchased successfully",
      data: populated,
    });
  }
);
