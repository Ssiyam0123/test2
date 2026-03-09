import express from "express";
import * as ReqController from "../controllers/requisition.controller.js";
import {
  verifyToken,
  requirePermission,
  injectBranchFilter,
} from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get(
  "/",
  requirePermission(PERMISSIONS.VIEW_REQUISITIONS),
  ReqController.getAllRequisitions,
);
router.get(
  "/class/:classId",
  requirePermission(PERMISSIONS.VIEW_REQUISITIONS),
  ReqController.getClassRequisition,
);
router.post(
  "/",
  requirePermission(PERMISSIONS.REQUEST_REQUISITION),
  ReqController.submitRequisition,
);
router.put(
  "/:id/approve",
  requirePermission(PERMISSIONS.MANAGE_REQUISITIONS),
  ReqController.approveClassRequisition,
);
router.put(
  "/:id/reject",
  requirePermission(PERMISSIONS.MANAGE_REQUISITIONS),
  ReqController.rejectClassRequisition,
);

export default router;
