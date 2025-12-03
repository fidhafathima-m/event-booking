import express from "express"
import {body} from 'express-validator';
const router = express.Router();
import validateRequest from '../utils/validation';
import { protect, authorize } from '../middleware/auth';
import {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  getAllServices,
  toggleServiceActive,
  getProviderDashboard
} from '../controllers/adminController';

// Validation rules
const updateRoleValidation = [
  body('role').isIn(['user', 'admin', 'provider']).withMessage('Invalid role')
];

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateRoleValidation, validateRequest, updateUserRole);

// Service management
router.get('/services', getAllServices);
router.put('/services/:id/toggle-active', toggleServiceActive);

// Provider management
router.get('/providers/:id/dashboard', getProviderDashboard);

module.exports = router;