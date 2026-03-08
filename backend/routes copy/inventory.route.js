import express from "express";
import * as ctrl from "../controllers/inventory.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addStockPurchaseSchema } from "../validators/inventory.validator.js";

const router = express.Router();

router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/", requirePermission("view_inventory"), ctrl.getBranchInventory);
router.get("/transactions", requirePermission("view_inventory"), ctrl.getBranchTransactions);

router.post("/purchase", requirePermission("manage_inventory"), validate(addStockPurchaseSchema), ctrl.addStockPurchase);

export default router;