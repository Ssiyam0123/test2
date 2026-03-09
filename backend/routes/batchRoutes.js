import express from "express";
import * as batchCtrl from "../controllers/batch.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; 
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/", requirePermission(PERMISSIONS.VIEW_BATCHES), batchCtrl.getAllBatches);
router.get("/:id", requirePermission(PERMISSIONS.VIEW_BATCHES), batchCtrl.getBatchById);
router.post("/", requirePermission(PERMISSIONS.MANAGE_BATCHES), batchCtrl.createBatch);
router.put("/:id", requirePermission(PERMISSIONS.MANAGE_BATCHES), batchCtrl.updateBatch);
router.delete("/:id", requirePermission(PERMISSIONS.DELETE_BATCH), batchCtrl.deleteBatch);

export default router;