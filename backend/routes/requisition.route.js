import express from "express";
import * as ReqController from "../controllers/requisition.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/", requirePermission(PERMISSIONS.VIEW_INVENTORY), ReqController.getAllRequisitions); // Inventory page loads this
router.get("/class/:classId", requirePermission(PERMISSIONS.VIEW_BATCH_WORKSPACE), ReqController.getClassRequisition); 
router.post("/", requirePermission(PERMISSIONS.SEND_REQUISITION), ReqController.submitRequisition);
router.put("/:id/approve", requirePermission(PERMISSIONS.INVENTORY_REQUISITION_ACTION), ReqController.approveClassRequisition);
router.put("/:id/reject", requirePermission(PERMISSIONS.INVENTORY_REQUISITION_ACTION), ReqController.rejectClassRequisition);

export default router;