import express from "express";
import * as batchCtrl from "../controllers/batch.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; 
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/", requirePermission(PERMISSIONS.VIEW_ALL_BATCHES), batchCtrl.getAllBatches);
router.get("/:id", requirePermission(PERMISSIONS.VIEW_BATCH_WORKSPACE), batchCtrl.getBatchById);
router.post("/", requirePermission(PERMISSIONS.BATCH_EDIT), batchCtrl.createBatch);
router.put("/:id", requirePermission(PERMISSIONS.BATCH_EDIT), batchCtrl.updateBatch);
router.delete("/:id", requirePermission(PERMISSIONS.BATCH_DELETE), batchCtrl.deleteBatch);

export default router;