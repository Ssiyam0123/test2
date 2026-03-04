import express from "express";
import * as ctrl from "../controllers/inventory.controller.js";
import { verifyToken, requirePermission, } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { stockPurchaseSchema } from "../validators/inventory.validator.js";

const router = express.Router();

router.use(verifyToken);
// router.use(branchGuard);


// Read Inventory
router.get(
  "/:branchId([0-9a-fA-F]{24})", 
  requirePermission("view_inventory"), 
  ctrl.getBranchInventory
);

router.get(
  "/:branchId([0-9a-fA-F]{24})/transactions", 
  requirePermission("view_inventory"), 
  ctrl.getBranchTransactions
);

// Write Inventory (Direct Restock)
router.post(
  "/:branchId([0-9a-fA-F]{24})/purchase", 
  requirePermission("manage_inventory"), 
  validate(stockPurchaseSchema), 
  ctrl.addStockPurchase
);

export default router;