import express from "express";
import * as reqCtrl from "../controllers/requisition.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();
router.use(protectRoute);

router.get("/class/:classId", reqCtrl.getClassRequisition);
router.put("/class/:classId", authorize("superadmin", "admin", "instructor"), reqCtrl.upsertRequisition);

export default router;