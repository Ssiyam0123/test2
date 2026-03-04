import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js"; 
import { validate } from "../middlewares/validate.js";
import { userCreateSchema, loginSchema } from "../validators/user.validator.js";
import ApiResponse from "../utils/ApiResponse.js"; 

const router = express.Router();

router.post("/register", validate(userCreateSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", verifyToken, logout);

router.get("/check", verifyToken, (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "User authenticated successfully"));
});

export default router;