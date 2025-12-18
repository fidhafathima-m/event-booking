import express from "express";
import {
  getMe,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resendOTPController,
  updateProfile,
  verifyOTPController,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import {
  validateLogin,
  validateProfileUpdate,
  validateRegistration,
} from "../utils/formValidations.js";

const router = express.Router();

// Routes with custom validation
router.post("/register", validateRegistration, register);
router.post("/verify-otp", verifyOTPController);
router.post("/resend-otp", resendOTPController);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, validateProfileUpdate, updateProfile);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.post("/logout-all", protect, logoutAll);

export default router;
