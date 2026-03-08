import express from "express";
import * as financeCtrl from "../controllers/finance.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js"; 
import { collectPaymentSchema, updateDiscountSchema } from "../validators/finance.validator.js"; 

const router = express.Router();

router.use(verifyToken); 


router.get("/fees", requirePermission("view_finance"), injectBranchFilter, financeCtrl.getCampusFees);
router.get("/student/:studentId", requirePermission("view_finance"), injectBranchFilter, financeCtrl.getStudentFinance);
router.get("/receipt/:id/download", requirePermission("view_finance"), injectBranchFilter, financeCtrl.downloadPaymentReceipt);


router.post("/pay", requirePermission("collect_payment"), injectBranchFilter, validate(collectPaymentSchema), financeCtrl.collectPayment);
router.patch("/fee/:feeId/discount", requirePermission("apply_discount"), injectBranchFilter, validate(updateDiscountSchema), financeCtrl.updateFeeDiscount);
router.post("/remind-sms", requirePermission("manage_finance"), financeCtrl.sendSMSReminder);

export default router;