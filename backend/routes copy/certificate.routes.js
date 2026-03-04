import express from "express";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { downloadCertificatePDF } from "../controllers/certificate.controller.js";
import { downloadEmployeeID } from "../controllers/employeeid.controller.js";

const router = express.Router();

// Basic token validation. Can add requirePermission("view_students") if needed.
router.get("/download/:id", verifyToken, downloadCertificatePDF);
router.get("/employeeid/download/:id", verifyToken, downloadEmployeeID);

export default router;