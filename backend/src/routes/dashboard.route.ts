import { Router } from "express";
import { getDashboardOverview } from "../controllers/dashboard.controller";
import { authorized } from "../middleware/authRole";
import authMiddleware from "../middleware/authMiddleware";
import { globalStats } from "../controllers/adminController";
import User, { IUser } from "../models/user";
import { Response, Request } from "express";


interface AuthRequest extends Request {
  user?: IUser;
}

const router = Router();

router.get("/dashboard-overview",authMiddleware, authorized('organizer'), getDashboardOverview);

// admin dashboard
router.get('/dashboard-stats', authMiddleware, authorized('admin'), globalStats);




export default router;
