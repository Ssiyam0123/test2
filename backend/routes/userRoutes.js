import express from "express";
import {
  addUser, deleteUser, getAllUsers, getUserById, updateUser,
  updateUserStatus, removeUserImage, searchUser, updateUserRole
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { userCreateSchema, userUpdateSchema, roleUpdateSchema } from "../validators/user.validator.js";

const router = express.Router();
router.use(protectRoute);

router.get("/search", authorize("superadmin", "admin", "registrar"), searchUser);
router.get("/all", authorize("superadmin", "admin", "registrar"), getAllUsers);
router.get("/:id", authorize("superadmin", "admin", "registrar"), getUserById);

router.post("/create", authorize("superadmin", "admin"), upload.single("photo"), validate(userCreateSchema), addUser);
router.put("/:id", authorize("superadmin", "admin"), upload.single("photo"), validate(userUpdateSchema), updateUser);
router.delete("/:id/image", authorize("superadmin", "admin"), removeUserImage);
router.delete("/:id", authorize("superadmin", "admin"), deleteUser);
router.patch("/update-status/:id", authorize("superadmin", "admin"), updateUserStatus);
router.patch("/:id/role", authorize("superadmin", "admin"), validate(roleUpdateSchema), updateUserRole);

export default router;