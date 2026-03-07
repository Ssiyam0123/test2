import express from "express";
import * as ReqController from "../controllers/requisition.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

// 🚀 Zod validation middleware এবং schema ইম্পোর্ট করে নে (তোর ফাইলের পাথ অনুযায়ী চেঞ্জ করিস)
import { validate } from "../middlewares/validate.js";
import { requisitionUpsertSchema } from "../validators/requisition.validator.js"; 

const router = express.Router();

router.use(verifyToken);
router.use(injectBranchFilter);

// Get specific class requisition
router.get("/class/:classId", ReqController.getClassRequisition);

// 🚀 FIXED: POST রাউটে validate(requisitionUpsertSchema) অ্যাড করা হলো
// Teachers/Admins can create
router.post("/", 
  requirePermission("manage_classes"), 
  validate(requisitionUpsertSchema), // 👈 এটা অ্যাড করবি 
  ReqController.submitRequisition
);

// ONLY Admins can approve/reject
router.put("/:id/approve", requirePermission("approve_requisitions"), ReqController.approveClassRequisition);
router.put("/:id/reject", requirePermission("approve_requisitions"), ReqController.rejectClassRequisition);

// Get all requisitions
router.get("/", requirePermission("view_requisitions"), ReqController.getAllRequisitions);

export default router;