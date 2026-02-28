import express from "express";
import {
  getBranchStats,
  getDashboardStats,
} from "../controllers/dashboard.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/stats",
  protectRoute,
  authorize("admin", "registrar"),
  getDashboardStats,
);
router.get(
  "/branch-stats/:branchId",
  protectRoute,
  authorize("admin", "register", "instructor"),
  getBranchStats,
);

export default router;
