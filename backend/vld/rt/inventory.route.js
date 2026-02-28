import express from "express";
import { authorize } from "../middlewares/auth.js"; // Your auth middleware
import { 
  getBranchInventory, 
  getBranchTransactions, 
  addStockPurchase, 
  deductClassRequisition 
} from "../controllers/inventory.controller.js";

const router = express.Router();

router.get("/:branchId", getBranchInventory);
router.get("/:branchId/transactions", getBranchTransactions);
router.post("/:branchId/purchase", authorize("admin", "staff"), addStockPurchase);
router.post("/:branchId/classes/:classId/deduct", authorize("admin", "instructor"), deductClassRequisition);

export default router;