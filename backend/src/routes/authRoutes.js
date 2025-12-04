import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../utils/validation.js";
import {
  getMe,
  login,
  logout,
  register,
  resendOTPController,
  updateProfile,
  verifyOTPController,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
const router = express.Router();

// Validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please enter a valid phone number"),
  body("role")
    .optional()
    .isIn(["user", "admin", "provider"])
    .withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, validateRequest, register);
router.post('/verify-otp', verifyOTPController);
router.post('/resend-otp', resendOTPController);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post("/logout", protect, logout);

export default router;
