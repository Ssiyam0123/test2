import express from "express";
import * as batchCtrl from "../controllers/batch.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; 
import { validate } from "../middlewares/validate.js";
import { batchCreateSchema, batchUpdateSchema } from "../validators/batch.validator.js"; 

const router = express.Router();

router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/", requirePermission("view_classes"), batchCtrl.getAllBatches);
router.get("/:id", requirePermission("view_classes"), batchCtrl.getBatchById);
router.post("/", requirePermission("manage_classes"), validate(batchCreateSchema), batchCtrl.createBatch);
router.put("/:id", requirePermission("manage_classes"), validate(batchUpdateSchema), batchCtrl.updateBatch);
router.delete("/:id", requirePermission("manage_classes"), batchCtrl.deleteBatch);

export default router;