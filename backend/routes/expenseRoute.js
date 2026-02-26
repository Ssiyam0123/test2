import express from "express";
import { getExpenses } from "../controllers/expenses.controller.js";

const router = express.Router();

// GET /api/expenses
// Query params accepted: ?branchId=... OR ?batchId=... OR ?classId=...
router.get("/",  getExpenses);

export default router;