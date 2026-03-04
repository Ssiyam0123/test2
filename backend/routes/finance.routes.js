import express from "express";
import { 
  collectPayment, getStudentFinance, getCampusFees, updateFeeDiscount 
} from "../controllers/finance.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; // 🚀 Updated Middleware
import { validate } from "../middlewares/validate.js"; 
import { paymentCreateSchema, feeUpdateSchema } from "../validators/finance.validator.js";

const router = express.Router();

router.use(verifyToken); 

// ==========================================
// READ ROUTES
// ==========================================
// 🚀 Campus fees are now strictly isolated
router.get("/fees", requirePermission("view_finance"), injectBranchFilter, getCampusFees);
router.get("/student/:studentId", requirePermission("view_finance"), getStudentFinance);

// ==========================================
// WRITE ROUTES
// ==========================================
router.post("/pay", requirePermission("collect_payment"), validate(paymentCreateSchema), collectPayment);
router.patch("/fee/:feeId/discount", requirePermission("apply_discount"), validate(feeUpdateSchema), updateFeeDiscount);

export default router;