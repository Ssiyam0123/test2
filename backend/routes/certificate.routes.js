import express from "express";

import protectRoute from "../middlewares/auth.middleware.js";
import { downloadCertificatePDF } from "../controllers/certificate.controller.js";

const router = express.Router();

router.get("/download/:id", protectRoute, downloadCertificatePDF);

export default router;
