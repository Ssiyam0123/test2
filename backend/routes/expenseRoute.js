import express from "express";
import { getExpenses } from "../controllers/expenses.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, requirePermission("view_finance"), injectBranchFilter, getExpenses);

export default router;