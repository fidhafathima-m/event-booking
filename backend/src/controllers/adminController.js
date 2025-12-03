import Booking from "../models/Booking";
import Service from "../models/Service";
import User from "../models/User";

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

    if (!["user", "admin", "provider"].includes(role)) {
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
      providerId,
      isActive,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    let query = {};
    if (category) query.category = category;
    if (providerId) query.provider = providerId;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get services with provider details
    const services = await Service.find(query)
      .populate("provider", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Service.countDocuments(query);

    res.status(200).json(
      ApiResponse.success("Services retrieved successfully", {
        services,
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

export const getProviderDashboard = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get provider details
    const provider = await User.findById(id).select("-password");
    if (!provider || provider.role !== "provider") {
      return res.status(404).json(ApiResponse.error("Provider not found", 404));
    }

    // Get provider's services
    const services = await Service.find({ provider: id }).select(
      "title category pricePerDay totalBookings rating"
    );

    // Get provider's bookings stats
    const bookingsStats = await Booking.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "serviceInfo",
        },
      },
      { $unwind: "$serviceInfo" },
      { $match: { "serviceInfo.provider": provider._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({
      "serviceInfo.provider": provider._id,
    })
      .populate("user", "name email")
      .populate("service", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json(
      ApiResponse.success("Provider dashboard retrieved successfully", {
        provider,
        stats: {
          totalServices: services.length,
          ...(bookingsStats[0] || {
            totalBookings: 0,
            totalRevenue: 0,
            confirmedBookings: 0,
          }),
        },
        services,
        recentBookings,
      })
    );
  } catch (error) {
    next(error);
  }
};
