import express from "express";
import { 
  collectPayment, getStudentFinance, getCampusFees, updateFeeDiscount 
} from "../controllers/finance.controller.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js"; 
import { paymentCreateSchema, feeUpdateSchema } from "../validators/finance.validator.js";

const router = express.Router();

router.use(verifyToken); 

// Read
router.get("/fees", requirePermission("view_finance"), branchGuard, getCampusFees);
router.get("/student/:studentId", requirePermission("view_finance"), getStudentFinance);

// Write
router.post("/pay", requirePermission("collect_payment"), validate(paymentCreateSchema), collectPayment);
router.patch("/fee/:feeId/discount", requirePermission("apply_discount"), validate(feeUpdateSchema), updateFeeDiscount);

export default router;