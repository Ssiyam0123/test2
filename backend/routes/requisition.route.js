import express from "express";
import * as ctrl from "../controllers/requisition.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; // 🚀 Updated Middleware

const router = express.Router();

router.use(verifyToken);

// ==========================================
// WRITE ROUTES
// ==========================================
router.post(
  "/create", 
  requirePermission("manage_classes"), 
  injectBranchFilter, // 🚀 Checks req.body.branch
  ctrl.upsertRequisition
);

router.post(
  "/:branchId/fulfill/:reqId", 
  requirePermission("manage_inventory"), 
  injectBranchFilter, // 🚀 Checks req.params.branchId
  ctrl.fulfillRequisition
);

router.patch(
  "/:branchId/reject/:reqId", 
  requirePermission("manage_inventory"), 
  injectBranchFilter, // 🚀 Checks req.params.branchId
  ctrl.rejectRequisition
);

// ==========================================
// READ ROUTES
// ==========================================
router.get(
  "/branch/:branchId/pending", 
  requirePermission("view_inventory"), 
  injectBranchFilter, // 🚀 Checks req.params.branchId
  ctrl.getPendingRequisitions
);

export default router;