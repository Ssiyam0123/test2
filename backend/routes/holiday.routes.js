import express from "express";
import { getHolidays, addHoliday, deleteHoliday } from "../controllers/holiday.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { holidayCreateSchema } from "../validators/holiday.validator.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getHolidays);
router.post("/", requirePermission("manage_classes"), validate(holidayCreateSchema), addHoliday);
router.delete("/:id", requirePermission("manage_classes"), deleteHoliday);

export default router;