import express from "express";
import { 
  collectPayment, 
  getStudentFinance, 
  getCampusFees, 
  updateFeeDiscount 
} from "../controllers/finance.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js"; // Assuming you have this
import { validateRequest } from "../middlewares/validate.middleware.js"; // Assuming you have this
import { paymentCreateSchema, feeUpdateSchema } from "../validators/finance.validator.js";

const router = express.Router();

// Apply auth middleware to all finance routes
router.use(protectRoute); 

// Global Dashboard List
router.get("/fees", getCampusFees);

// Single Student Finance Dashboard
router.get("/student/:studentId", getStudentFinance);

// Make a Payment
router.post("/pay", validateRequest(paymentCreateSchema), collectPayment);

// Manually update a student's discount
router.patch("/fee/:feeId/discount", validateRequest(feeUpdateSchema), updateFeeDiscount);

export default router;