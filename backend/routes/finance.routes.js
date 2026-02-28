import express from "express";
import { 
  collectPayment, 
  getStudentFinance, 
  getCampusFees, 
  updateFeeDiscount 
} from "../controllers/finance.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
// FIXED: Correct path to validate.js and correct function name 'validate'
import { validate } from "../middlewares/validate.js"; 
import { paymentCreateSchema, feeUpdateSchema } from "../validators/finance.validator.js";

const router = express.Router();

// Apply auth middleware to all finance routes
router.use(protectRoute); 

// Global Dashboard List
router.get("/fees", getCampusFees);

// Single Student Finance Dashboard
router.get("/student/:studentId", getStudentFinance);

// Make a Payment
// FIXED: Using 'validate' instead of 'validateRequest'
router.post("/pay", validate(paymentCreateSchema), collectPayment);

// Manually update a student's discount
// FIXED: Using 'validate' instead of 'validateRequest'
router.patch("/fee/:feeId/discount", validate(feeUpdateSchema), updateFeeDiscount);

export default router;