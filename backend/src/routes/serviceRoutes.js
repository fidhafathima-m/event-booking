import express from "express";
import { body } from "express-validator";
const router = express.Router();
import {
  checkAvailability,
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../controllers/serviceController.js";
import { protect } from "../middlewares/auth.js";
import { validateRequest } from "../utils/validation.js";

// Validation rules
const serviceValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category")
    .isIn([
      "venue",
      "caterer",
      "photographer",
      "videographer",
      "dj",
      "decorator",
      "makeup",
      "transport",
    ])
    .withMessage("Invalid category"),
  body("pricePerDay")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("contactInfo.email")
    .isEmail()
    .withMessage("Valid contact email is required"),
  body("contactInfo.phone").notEmpty().withMessage("Contact phone is required"),
  body("contactInfo.address")
    .trim()
    .notEmpty()
    .withMessage("Contact address is required"),
];

const availabilityValidation = [
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
];

// Public routes
router.get("/", getServices);
router.get("/:id", getServiceById);
router.post(
  "/:id/check-availability",
  availabilityValidation,
  validateRequest,
  checkAvailability
);

// Protected routes
router.use(protect);
router.post("/", serviceValidation, validateRequest, createService);
router.put(
  "/:id",
  serviceValidation,
  validateRequest,
  updateService
);
router.delete("/:id", deleteService);

export default router;
