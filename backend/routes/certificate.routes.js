import express from "express";
import { verifyToken, requirePermission } from "../middlewares/auth.js";

import { downloadCertificatePDF, sendCertificateEmail } from "../controllers/certificate.controller.js";
import { downloadEmployeeID } from "../controllers/employeeid.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(verifyToken);

// Certificate Routes

// router.get("/download/:id", requirePermission(PERMISSIONS.STUDENT_CERTIFICATE), downloadCertificatePDF);

// router.post("/send/:id", requirePermission(PERMISSIONS.STUDENT_CERTIFICATE), sendCertificateEmail);

// 🚀 GET এর বদলে POST হবে
router.post("/download/:id", requirePermission(PERMISSIONS.STUDENT_CERTIFICATE), downloadCertificatePDF);

// ইমেইল সেন্ডের রাউট আগের মতোই থাকবে
router.post("/send/:id", requirePermission(PERMISSIONS.STUDENT_CERTIFICATE), sendCertificateEmail);


// ID Card Routes
router.get("/employeeid/download/:id", requirePermission(PERMISSIONS.EMPLOYEE_IDCARD), downloadEmployeeID);

export default router;