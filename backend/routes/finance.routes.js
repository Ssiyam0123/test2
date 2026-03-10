import express from "express";
import * as financeCtrl from "../controllers/finance.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { collectPaymentSchema, updateDiscountSchema } from "../validators/finance.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/fees", requirePermission(PERMISSIONS.STUDENT_PAYMENTS), financeCtrl.getCampusFees);
router.get("/student/:studentId", requirePermission(PERMISSIONS.STUDENT_PAYMENTS), financeCtrl.getStudentFinance);
router.get("/receipt/:id/download", requirePermission(PERMISSIONS.STUDENT_PAYMENTS), financeCtrl.downloadPaymentReceipt);

router.post("/pay", requirePermission(PERMISSIONS.STUDENT_PAYMENTS), validate(collectPaymentSchema), financeCtrl.collectPayment);
router.patch("/fee/:feeId/discount", requirePermission(PERMISSIONS.STUDENT_PAYMENTS), validate(updateDiscountSchema), financeCtrl.updateFeeDiscount);
router.post("/remind-sms", requirePermission(PERMISSIONS.STUDENT_PAYMENTS), financeCtrl.sendSMSReminder);

export default router;