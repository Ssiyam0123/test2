import express from "express";
import protectRoute from "../middlewares/auth.middleware.js";
import { downloadCertificatePDF } from "../controllers/certificate.controller.js";
import { downloadEmployeeID } from "../controllers/employeeid.controller.js";

const router = express.Router();

router.get("/download/:id", protectRoute, downloadCertificatePDF);
router.get("/employeeid/download/:id", protectRoute, downloadEmployeeID);

export default router;