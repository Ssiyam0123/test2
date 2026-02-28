import express from "express";
import { authorize } from "../middlewares/auth.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { stockPurchaseSchema, requisitionDeductionSchema } from "../validators/inventory.validator.js";
import * as ctrl from "../controllers/inventory.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/:branchId", ctrl.getBranchInventory);
router.get("/:branchId/transactions", ctrl.getBranchTransactions);

router.post("/:branchId/purchase", authorize("superadmin", "admin", "staff"), validate(stockPurchaseSchema), ctrl.addStockPurchase);
router.post("/:branchId/classes/:classId/deduct", authorize("superadmin", "admin", "instructor"), validate(requisitionDeductionSchema), ctrl.deductClassRequisition);

export default router;