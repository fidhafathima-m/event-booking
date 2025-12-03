import express from "express";
import { body } from "express-validator";
import protect from "../middlewares/auth";
import validateRequest from "../utils/validation";
import {
  createBooking,
  getAllBookings,
  getBookingStats,
  getUpcomingBookings,
  updateBookingStatus,
} from "../controllers/bookingController";
const router = express.Router();

// Validation rules
const createBookingValidation = [
  body("serviceId").isMongoId().withMessage("Valid service ID is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
  body("guestsCount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Guests count must be at least 1"),
  body("specialRequirements").optional().trim(),
  body("contactPerson.name").optional().trim(),
  body("contactPerson.email")
    .optional()
    .isEmail()
    .withMessage("Valid contact email is required"),
  body("contactPerson.phone").optional().trim(),
];

const updateStatusValidation = [
  body("status")
    .isIn(["confirmed", "cancelled", "completed"])
    .withMessage("Invalid status"),
  body("cancellationReason").optional().trim(),
];

// Protected routes
router.use(protect);

// User can create bookings
router.post("/", createBookingValidation, validateRequest, createBooking);

// Get upcoming bookings
router.get("/upcoming", getUpcomingBookings);

// Admin/Provider only routes
router.get("/", authorize("admin", "provider"), getAllBookings);
router.get("/stats", authorize("admin", "provider"), getBookingStats);
router.put(
  "/:id/status",
  authorize("admin", "provider"),
  updateStatusValidation,
  validateRequest,
  updateBookingStatus
);

module.exports = router;
