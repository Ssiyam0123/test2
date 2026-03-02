import express from "express";
import * as ctrl from "../controllers/inventory.controller.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { stockPurchaseSchema, requisitionDeductionSchema } from "../validators/inventory.validator.js";

const router = express.Router();

router.use(verifyToken);
router.use(branchGuard); // Auto-filters by branch for all routes below

// Read
router.get("/:branchId", requirePermission("view_inventory"), ctrl.getBranchInventory);
router.get("/:branchId/transactions", requirePermission("view_inventory"), ctrl.getBranchTransactions);

// Write
router.post("/:branchId/purchase", requirePermission("manage_inventory"), validate(stockPurchaseSchema), ctrl.addStockPurchase);
router.post("/:branchId/classes/:classId/deduct", requirePermission("manage_inventory"), validate(requisitionDeductionSchema), ctrl.deductClassRequisition);

export default router;