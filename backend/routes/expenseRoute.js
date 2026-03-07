import express from "express";
import { getExpenses } from "../controllers/expenses.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

const router = express.Router();

// ==========================================
// READ ROUTES
// ==========================================
// 🚀 SECURED: Tied to view_finance, and strictly locked to user's branch
router.get("/", verifyToken, requirePermission("view_finance"), injectBranchFilter, getExpenses);

export default router;