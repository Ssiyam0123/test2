import express from "express";
import { getExpenses, getExpenseByClass } from "../controllers/expenses.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.get(
  "/", 
  verifyToken, 
  requirePermission(PERMISSIONS.VIEW_SETTINGS), 
  injectBranchFilter, 
  getExpenses
);

router.get(
  "/by-class/:branchId", 
  verifyToken, 
//   requirePermission(PERMISSIONS.VIEW_SETTINGS), 
  getExpenseByClass
);

export default router;