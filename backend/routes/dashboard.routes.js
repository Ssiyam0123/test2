import express from "express";
import { getBranchStats, getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; 

const router = express.Router();

router.use(verifyToken);

router.get("/stats", requirePermission("view_dashboard"), injectBranchFilter, getDashboardStats);
router.get("/branch-stats/:branchId", requirePermission("view_dashboard"), injectBranchFilter, getBranchStats);

export default router;