import express from "express";
import { getBranchStats, getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

// Require a basic 'view_dashboard' permission to see stats
router.get("/stats", requirePermission("view_dashboard"), getDashboardStats);
router.get("/branch-stats/:branchId", requirePermission("view_dashboard"), branchGuard, getBranchStats);

export default router;