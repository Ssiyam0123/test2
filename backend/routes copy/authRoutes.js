import express from "express";
import { login, register, checkAuth, logout } from "../controllers/auth.controller.js"; 
import { verifyToken } from "../middlewares/auth.js"; 
import { validate } from "../middlewares/validate.js";
import { userCreateSchema, loginSchema } from "../validators/user.validator.js";

const router = express.Router();

router.post("/register", validate(userCreateSchema), register);
router.post("/login", validate(loginSchema), login);

router.post("/logout", verifyToken, logout);

router.get("/check", verifyToken, checkAuth); 

export default router;