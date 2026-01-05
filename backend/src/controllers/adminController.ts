import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import Event from '../models/event';
import PurchasedTicket from '../models/PurchasedTicket';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request {
  user?: IUser; 
}

export const globalStats = asyncHandler(async(req: Request, res:Response): Promise<void> =>{

    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalTicketsSold = await PurchasedTicket.countDocuments({ status: 'success' });

    // Aggregation for revenue
    const revenueData = await PurchasedTicket.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);


   // Total quantity of all tickets sold
    const quantityData = await PurchasedTicket.aggregate([
      { $match: { status: 'success' } },
      { $unwind: "$tickets" },
      { $group: { _id: null, totalQty: { $sum: "$tickets.quantity" } } }
    ]);

   res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalEvents,
        totalTicketsSold: totalTicketsSold, // Number of orders
        actualTicketsQty: quantityData[0]?.totalQty || 0, // Individual tickets
        totalRevenue: revenueData[0]?.totalRevenue || 0
      }
    })
})


/**
 * GET /api/admin/users
 * Get all users with filters
 */

export const filterUsers = asyncHandler(async(req:Request,res:Response)=>{

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const status = req.query.status?.toString() || ""
    const role = req.query.role?.toString() || "";
    const search = req.query.search?.toString() || ""

     const filter: any = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get users
    const users = await User.find(filter)
      .select('-password') // Don't send passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: (page),
          limit: (limit),
          total,
          pages: Math.ceil(total / (limit)),
        },
      },
    });


})



/**
 * GET /api/admin/users/stats
 * Get user statistics
 */

export const userStats = asyncHandler(async(req:Request, res:Response)=> {

     const totalUsers = await User.countDocuments();
    const totalAttendees = await User.countDocuments({ role: 'attendee' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const unverifiedUsers = await User.countDocuments({ isVerified: false });

     res.json({
      success: true,
      data: {
        totalUsers,
        totalAttendees,
        totalOrganizers,
        totalAdmins,
        newUsers,
        unverifiedUsers,
      },
    });

})

/**
 * GET /api/admin/users/:id
 * Get single user details with activity
 */

export const getSingleUser = asyncHandler(async(req:Request, res:Response)=>{

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let activity = {};

       if (user.role === 'organizer') {
      const events = await Event.find({ organizerId: user._id });
      const eventIds = events.map(e => e._id);
      
      // Assuming you have a Booking/Ticket model
      const totalTicketsSold = await PurchasedTicket.countDocuments({ 
        eventId: { $in: eventIds } 
      });
      
      const totalRevenue = await PurchasedTicket.aggregate([
        { $match: { eventId: { $in: eventIds }, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      activity = {
        eventsCreated: events.length,
        totalTicketsSold,
        totalRevenue: totalRevenue[0]?.total || 0,
        events: events.slice(0, 5), // Last 5 events
      };
    } else if (user.role === 'attendee') {
      const bookings = await PurchasedTicket.find({ userId: user._id })
        .populate('eventId', 'title date venue')
        .sort({ createdAt: -1 })
        .limit(10);

      const totalSpent = await  PurchasedTicket.aggregate([
        { $match: { userId: user._id, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      activity = {
        ticketsPurchased: bookings.length,
        totalSpent: totalSpent[0]?.total || 0,
        recentBookings: bookings,
      };
    }

    res.json({
      success: true,
      data: { user, activity },
    });


})

/**
 * PUT /api/admin/users/:id
 * Update user details
 */

export const updateUser = asyncHandler(async(req:Request, res: Response)=>{
    const { fullName, email, role, organizationName, phone, country, location } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (location !== undefined) user.location = location;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
})

/**
 * PUT /api/admin/users/:id/role
 * Change user role
 */

export const changeRole = asyncHandler(async(req: Request, res:Response)=>{
        const { role } = req.body;

    if (!['attendee', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
})

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */

export const deleteUser = asyncHandler (async(req: AuthRequest, res: Response)=>{
        const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user?._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
})