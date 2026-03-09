import express from "express";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { downloadCertificatePDF } from "../controllers/certificate.controller.js";
import { downloadEmployeeID } from "../controllers/employeeid.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.get("/download/:id", verifyToken, requirePermission(PERMISSIONS.VIEW_STUDENT_DETAILS), downloadCertificatePDF);
router.get("/employeeid/download/:id", verifyToken, requirePermission(PERMISSIONS.VIEW_EMPLOYEES), downloadEmployeeID);

export default router;