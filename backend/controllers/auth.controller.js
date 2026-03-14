import * as AuthService from "../services/auth.service.js";
import { generateToken } from "../lib/genToken.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: Login]
// ==========================================
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await AuthService.authenticateUser(email, password);
  
  const token = generateToken(user._id, user.role?.name, res);

  res.status(200).json({
    token,
    user: AuthService.formatUserResponse(user),
  });
});

// ==========================================
// 🐳 [Controller: Check Auth]
// ==========================================
export const checkAuth = catchAsync(async (req, res) => {
  const user = await AuthService.fetchAuthenticatedUser(req.user._id);

  res.status(200).json(
    new ApiResponse(200, AuthService.formatUserResponse(user), "User authenticated successfully")
  );
});

// ==========================================
// 🐳 [Controller: Register]
// ==========================================
export const register = catchAsync(async (req, res) => {
  const populatedUser = await AuthService.registerNewUser(req.body);

  res.status(201).json({
    message: "Account registered successfully.",
    user: AuthService.formatUserResponse(populatedUser),
  });
});

// ==========================================
// 🐳 [Controller: Logout]
// ==========================================
export const logout = catchAsync(async (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
  });

  res.status(200).json(
    new ApiResponse(200, null, "Logged out successfully")
  );
});