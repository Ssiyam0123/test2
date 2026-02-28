import express from "express";
import { getExpenses } from "../controllers/expenses.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// SECURED: Added auth and roles to protect financial data
router.get("/", protectRoute, authorize("superadmin", "admin", "registrar"), getExpenses);

export default router;