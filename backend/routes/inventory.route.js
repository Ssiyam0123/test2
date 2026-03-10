import express from "express";
import * as ctrl from "../controllers/inventory.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addStockPurchaseSchema } from "../validators/inventory.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/", requirePermission(PERMISSIONS.VIEW_INVENTORY), ctrl.getBranchInventory);
router.get("/transactions", requirePermission(PERMISSIONS.VIEW_INVENTORY), ctrl.getBranchTransactions);
router.post("/purchase", requirePermission(PERMISSIONS.INVENTORY_ADD_STOCK), validate(addStockPurchaseSchema), ctrl.addStockPurchase);

export default router;