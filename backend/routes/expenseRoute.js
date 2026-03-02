import express from "express";
import { getExpenses } from "../controllers/expenses.controller.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";

const router = express.Router();

// SECURED: Tied to view_finance, and strictly locked to user's branch
router.get("/", verifyToken, requirePermission("view_finance"), branchGuard, getExpenses);

export default router;