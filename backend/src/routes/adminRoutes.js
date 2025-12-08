import express from 'express';
import { body } from 'express-validator';
const router = express.Router();
import { protect, authorize } from '../middlewares/auth.js';
import { 
  getPlatformStats, 
  getAllUsers,
  updateUserRole,
  getAllServices,
  toggleServiceActive,
  createService,
  updateService,
  deleteService
} from '../controllers/adminController.js';
import { validateRequest } from '../utils/validation.js';
import { getAllBookings, updateBookingStatus } from '../controllers/bookingController.js';

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Service validation rules for admin
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

// Dashboard
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// Service management
router.get('/services', getAllServices);
router.post('/services', serviceValidation, validateRequest, createService);
router.put('/services/:id/toggle-active', toggleServiceActive);
router.put('/services/:id', serviceValidation, validateRequest, updateService);
router.delete('/services/:id', deleteService);

router.get('/bookings', protect, authorize('admin'), getAllBookings);
router.put('/bookings/:id/status', protect, authorize('admin'), updateBookingStatus);


export default router;