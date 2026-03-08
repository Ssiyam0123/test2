import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { downloadCertificatePDF } from "../controllers/certificate.controller.js";
import { downloadEmployeeID } from "../controllers/employeeid.controller.js";

const router = express.Router();

router.get("/download/:id", verifyToken, downloadCertificatePDF);
router.get("/employeeid/download/:id", verifyToken, downloadEmployeeID);

export default router;