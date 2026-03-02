import express from "express";
import * as reqCtrl from "../controllers/requisition.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

router.get("/class/:classId", requirePermission("request_bazar"), reqCtrl.getClassRequisition);
router.put("/class/:classId", requirePermission("request_bazar"), reqCtrl.upsertRequisition);

export default router;