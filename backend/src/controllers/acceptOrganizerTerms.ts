import { asyncHandler } from "../utils/asyncHandler";
import { Response, Request } from "express";
import { AppError } from "../utils/AppError";
import User, { IUser } from "../models/user";

interface AuthRequest extends Request {
  user?: IUser;
}

export const acceptedOrganizerTerms = asyncHandler(async(req: AuthRequest, res: Response) => {
    
    const userId = req.user?.id; 

    if (!userId) {
        throw new AppError('Authentication required to perform this action.', 401);
    }
    
    
    const { acceptedOrganizerTerms } = req.body;

    if (acceptedOrganizerTerms !== true) {
        throw new AppError('Invalid request body. ', 400);
    }

    
    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $set: { acceptedOrganizerTerms: true } },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
    
        throw new AppError('User not found or database update failed.', 404);
    }
    
    
    res.status(200).json({
        message: 'Organizer terms accepted successfully.',
        success: true,
        user: updatedUser
    });
});