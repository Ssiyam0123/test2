import express from "express";
import {
  getDashboardStats
} from "../controllers/dashboard.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";


const router = express.Router();

router.get("/stats", protectRoute,authorize("admin", "registrar",),   getDashboardStats);

export default router;
