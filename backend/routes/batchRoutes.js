import express from "express";
import * as batchCtrl from "../controllers/batch.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js"; // Your role checker

const router = express.Router();
router.use(protectRoute);

router.get("/", batchCtrl.getAllBatches);
router.get("/:id", batchCtrl.getBatchById);

// Both levels of admin can create and update
router.post("/", authorize("superadmin", "admin", "registrar"), batchCtrl.createBatch);
router.put("/:id", authorize("superadmin", "admin", "registrar"), batchCtrl.updateBatch);

// STRICT CONTROL: Only the top boss can delete a batch entirely
router.delete("/:id", authorize("superadmin"), batchCtrl.deleteBatch);

export default router;