import express from "express";
import { 
  collectPayment, 
  getStudentFinance, 
  getCampusFees, 
  updateFeeDiscount, 
  downloadPaymentReceipt,
  sendSMSReminder 
} from "../controllers/finance.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js"; 
import { collectPaymentSchema, updateDiscountSchema } from "../validators/finance.validator.js"; 

const router = express.Router();

router.use(verifyToken); 


router.get("/fees", requirePermission("view_finance"), injectBranchFilter, getCampusFees);
router.get("/student/:studentId", requirePermission("view_finance"), getStudentFinance);
router.get("/receipt/:id/download", requirePermission("view_finance"), downloadPaymentReceipt);


router.post("/pay", requirePermission("collect_payment"), validate(collectPaymentSchema), collectPayment);
router.patch("/fee/:feeId/discount", requirePermission("apply_discount"), validate(updateDiscountSchema), updateFeeDiscount);

router.post("/remind-sms", requirePermission("manage_finance"), sendSMSReminder);

export default router;