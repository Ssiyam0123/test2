import express from "express";
import * as ctrl from "../controllers/mastersyllabus.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createMasterSyllabusSchema, updateMasterSyllabusSchema } from "../validators/masterSyllabus.validator.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", requirePermission("view_courses"), ctrl.getAllMasterTopics);
router.get("/topic/:id", requirePermission("view_courses"), ctrl.getSyllabusTopicById);

router.post("/", requirePermission("manage_courses"), validate(createMasterSyllabusSchema), ctrl.createMasterSyllabus);
router.put("/topic/:id", requirePermission("manage_courses"), validate(updateMasterSyllabusSchema), ctrl.updateMasterSyllabus);
router.delete("/topic/:id", requirePermission("manage_courses"), ctrl.deleteMasterSyllabus);

export default router;