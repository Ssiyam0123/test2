import express from "express";
import { getBranchStats, getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; // 🚀 Updated Middleware

const router = express.Router();

router.use(verifyToken);

// ==========================================
// READ ROUTES
// ==========================================
// Global stats (Usually for Superadmin)
router.get("/stats", requirePermission("view_dashboard"), getDashboardStats);

// Branch specific stats (Secured by injectBranchFilter)
router.get("/branch-stats/:branchId", requirePermission("view_dashboard"), injectBranchFilter, getBranchStats);

export default router;