import express from "express";
import { getBranchStats, getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; 
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);

router.get("/stats", requirePermission(PERMISSIONS.VIEW_DASHBOARD), injectBranchFilter, getDashboardStats);
router.get("/branch-stats/:branchId", requirePermission(PERMISSIONS.VIEW_BRANCH_STATS), injectBranchFilter, getBranchStats);

export default router;