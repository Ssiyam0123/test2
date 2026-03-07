import express from "express";
import { collectPayment, getStudentFinance, getCampusFees, updateFeeDiscount, downloadPaymentReceipt } from "../controllers/finance.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js"; 
import { collectPaymentSchema, updateDiscountSchema } from "../validators/finance.validator.js"; // 🚀 Updated Zod Names

const router = express.Router();

router.use(verifyToken); 

// ==========================================
// READ ROUTES
// ==========================================
router.get("/fees", requirePermission("view_finance"), injectBranchFilter, getCampusFees);
router.get("/student/:studentId", requirePermission("view_finance"), getStudentFinance);

// ==========================================
// WRITE ROUTES
// ==========================================
router.post("/pay", requirePermission("collect_payment"), validate(collectPaymentSchema), collectPayment);
router.patch("/fee/:feeId/discount", requirePermission("apply_discount"), validate(updateDiscountSchema), updateFeeDiscount);


router.get("/receipt/:id/download", requirePermission("view_finance"), downloadPaymentReceipt);

export default router;