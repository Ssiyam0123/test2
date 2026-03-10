import express from "express";
import { getHolidays, addHoliday, deleteHoliday } from "../controllers/holiday.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { holidayCreateSchema } from "../validators/holiday.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", requirePermission(PERMISSIONS.VIEW_BATCH_CALENDAR), getHolidays);
router.post("/", requirePermission(PERMISSIONS.MANAGE_SETTINGS), validate(holidayCreateSchema), addHoliday);
router.delete("/:id", requirePermission(PERMISSIONS.MANAGE_SETTINGS), deleteHoliday);

export default router;