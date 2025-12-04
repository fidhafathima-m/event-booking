import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { ApiResponse } from "../utils/responseHandler.js";

export const getPlatformStats = async (req, res, next) => {
  try {
    // Get counts using Promise.all for efficiency
    const [
      totalUsers,
      totalServices,
      totalBookings,
      activeBookings,
      totalRevenue,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),
      Booking.find()
        .populate("user", "name email")
        .populate("service", "title")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Get category-wise service distribution
    const serviceByCategory = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get booking status distribution
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json(
      ApiResponse.success("Platform statistics retrieved successfully", {
        stats: {
          totalUsers,
          totalServices,
          totalBookings,
          activeBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        serviceByCategory,
        bookingsByStatus,
        recentUsers,
        recentBookings,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    // Build query
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get users
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json(
      ApiResponse.success("Users retrieved successfully", {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json(ApiResponse.error("Invalid role specified", 400));
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json(ApiResponse.error("User not found", 404));
    }

    res
      .status(200)
      .json(ApiResponse.success("User role updated successfully", { user }));
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const { 
      category, 
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    console.log('Query parameters received:', req.query);

    // Build query
    let query = {};
    
    
    // // Handle isActive filter
    // if (isActive === 'true') {
    //   query.isActive = true;
    // } else if (isActive === 'false') {
    //   query.isActive = false;
    // }
    
    // Other filters
    if (category && category !== '' && category !== 'undefined') {
      query.category = category;
    }
    
    // Remove providerId filter
    
    if (search && search !== '' && search !== 'undefined') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Count total documents
    const total = await Service.countDocuments(query);

    // Get services - admin can see all services
    const services = await Service.find(query)
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json(
      ApiResponse.success('Services retrieved successfully', {
        services,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      })
    );
  } catch (error) {
    console.error('Error in getAllServices:', error);
    next(error);
  }
};

export const toggleServiceActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json(ApiResponse.error("Service not found", 404));
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json(
      ApiResponse.success("Service status updated successfully", {
        service,
        message: service.isActive ? "Service activated" : "Service deactivated",
      })
    );
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const serviceData = req.body;

    // Only admin can create services (since there are no providers)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json(
          ApiResponse.error("Only admins can create services", 403)
        );
    }

    // Admin creates services - set provider to admin's ID
    serviceData.provider = userId;

    // Create service
    const service = await Service.create(serviceData);

    res
      .status(201)
      .json(
        ApiResponse.success("Service created successfully", { service }, 201)
      );
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json(ApiResponse.error("Service not found", 404));
    }

    // Only admin can update services
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json(ApiResponse.error("Not authorized to update this service", 403));
    }

    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json(
        ApiResponse.success("Service updated successfully", {
          service: updatedService,
        })
      );
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // find service
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json(ApiResponse.error("Service not found", 404));
    }

    // Only admin can delete services
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json(ApiResponse.error("Not authorized to delete this service", 403));
    }

    // soft delete service
    service.isActive = false;
    await service.save();

    res.status(200).json(ApiResponse.success("Service deleted successfully"));
  } catch (error) {
    next(error);
  }
};
