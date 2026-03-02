import express from "express";
import * as batchCtrl from "../controllers/batch.controller.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

// Read
router.get("/", requirePermission("view_classes"), branchGuard, batchCtrl.getAllBatches);
router.get("/:id", requirePermission("view_classes"), batchCtrl.getBatchById);

// Write
router.post("/", requirePermission("manage_classes"), batchCtrl.createBatch);
router.put("/:id", requirePermission("manage_classes"), batchCtrl.updateBatch);
router.delete("/:id", requirePermission("manage_classes"), batchCtrl.deleteBatch);

export default router;