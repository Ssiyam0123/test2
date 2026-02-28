import express from "express";
import { getBranchStats, getDashboardStats } from "../controllers/dashboard.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/stats", protectRoute, authorize("superadmin", "admin", "registrar"), getDashboardStats);

// FIXED TYPO: "register" -> "registrar"
router.get("/branch-stats/:branchId", protectRoute, authorize("superadmin", "admin", "registrar", "instructor"), getBranchStats);

export default router;