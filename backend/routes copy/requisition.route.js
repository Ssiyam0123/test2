import express from "express";
import * as ReqController from "../controllers/requisition.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

import { validate } from "../middlewares/validate.js";
import { requisitionUpsertSchema } from "../validators/requisition.validator.js"; 

const router = express.Router();

router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/class/:classId", ReqController.getClassRequisition);

router.post("/", 
  requirePermission("manage_classes"), 
  validate(requisitionUpsertSchema), 
  ReqController.submitRequisition
);

router.put("/:id/approve", requirePermission("approve_requisitions"), ReqController.approveClassRequisition);
router.put("/:id/reject", requirePermission("approve_requisitions"), ReqController.rejectClassRequisition);

router.get("/", requirePermission("view_requisitions"), ReqController.getAllRequisitions);

export default router;