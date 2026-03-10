import express from "express";
import * as financeCtrl from "../controllers/finance.controller.js";
import {
  verifyToken,
  requirePermission,
  injectBranchFilter,
} from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  collectPaymentSchema,
  updateDiscountSchema,
} from "../validators/finance.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(verifyToken);

router.get(
  "/fees",
  requirePermission(PERMISSIONS.VIEW_FINANCE),
  injectBranchFilter,
  financeCtrl.getCampusFees,
);
router.get(
  "/student/:studentId",
  requirePermission(PERMISSIONS.VIEW_FINANCE),
  injectBranchFilter,
  financeCtrl.getStudentFinance,
);
router.get(
  "/receipt/:id/download",
  requirePermission(PERMISSIONS.VIEW_FINANCE),
  injectBranchFilter,
  financeCtrl.downloadPaymentReceipt,
);

router.post(
  "/pay",
  requirePermission(PERMISSIONS.COLLECT_FEES),
  injectBranchFilter,
  validate(collectPaymentSchema),
  financeCtrl.collectPayment,
);
router.patch(
  "/fee/:feeId/discount",
  requirePermission(PERMISSIONS.APPLY_DISCOUNT),
  injectBranchFilter,
  validate(updateDiscountSchema),
  financeCtrl.updateFeeDiscount,
);
router.post(
  "/remind-sms",
  requirePermission(PERMISSIONS.MANAGE_FINANCE),
  financeCtrl.sendSMSReminder,
);

export default router;
