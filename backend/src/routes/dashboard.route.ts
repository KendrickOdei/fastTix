import { Router } from "express";
import { getDashboardOverview } from "../controllers/dashboard.controller";
import { authorized } from "../middleware/authRole";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/dashboard-overview",authMiddleware, authorized('organizer'), getDashboardOverview);

export default router;
