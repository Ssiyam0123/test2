import express from "express";
import * as ctrl from "../controllers/requisition.controller.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);


router.post(
  "/create", 
  requirePermission("manage_classes"), 
  ctrl.upsertRequisition
);

router.get(
  "/branch/:branchId/pending", 
  requirePermission("view_inventory"), 
  branchGuard, 
  ctrl.getPendingRequisitions
);

router.post(
  "/:branchId/fulfill/:reqId", 
  requirePermission("manage_inventory"), 
  ctrl.fulfillRequisition
);

router.patch(
  "/:branchId/reject/:reqId", 
  requirePermission("manage_inventory"), 
  ctrl.rejectRequisition
);

export default router;