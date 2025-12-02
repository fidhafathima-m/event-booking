import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  cancelBooking,
  getBookingsById,
  getUserBookings,
  getUserDashboard,
} from "../controllers/userController.js";
const router = express.Router();

router.use(protect);

// Routes
router.get("/dashboard", getUserDashboard);

router.get("/bookings", getUserBookings);
router.get("/bookings/:id", getBookingsById);
router.put("/bookings/:id/cancel", cancelBooking);

export default router