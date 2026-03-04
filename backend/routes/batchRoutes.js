import express from "express";
import * as batchCtrl from "../controllers/batch.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; 

const router = express.Router();

router.use(verifyToken);

// ==========================================
// READ ROUTES
// ==========================================
router.get("/", requirePermission("view_classes"), injectBranchFilter, batchCtrl.getAllBatches);
router.get("/:id", requirePermission("view_classes"), batchCtrl.getBatchById);

// ==========================================
// WRITE ROUTES
// ==========================================
router.post("/", requirePermission("manage_classes"), batchCtrl.createBatch);
router.put("/:id", requirePermission("manage_classes"), batchCtrl.updateBatch);
router.delete("/:id", requirePermission("manage_classes"), batchCtrl.deleteBatch);

export default router;