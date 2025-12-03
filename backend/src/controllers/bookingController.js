import Service from "../models/Service.js";
import Booking from "../models/Booking.js";

export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      serviceId,
      startDate,
      endDate,
      guestsCount,
      specialRequirements,
      contactPerson,
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json(ApiResponse.error("End date must be after start date", 400));
    }

    if (start < new Date()) {
      return res
        .status(400)
        .json(ApiResponse.error("Start date cannot be in the past", 400));
    }

    // check service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res
        .status(404)
        .json(ApiResponse.error("Service not found or inactive", 404));
    }

    // check availability
    const existingBookings = await Booking.find({
      service: serviceId,
      status: { $in: ["confirmed", "pending"] },
      $or: [
        {
          "bookingDates.startDate": { $lte: end },
          "bookingDates.endDate": { $gte: start },
        },
      ],
    });

    if (existingBookings.length > 0) {
      return res
        .status(400)
        .json(
          ApiResponse.error("Service not available for selected dates", 400)
        );
    }

    // calculate total price
    const totalDays = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
    const totalPrice = service.pricePerDay * totalDays;

    // Check capacity if applicable
    if (service.capacity && guestsCount > service.capacity) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            `Maximum capacity is ${service.capacity} guests`,
            400
          )
        );
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      service: serviceId,
      bookingDates: {
        startDate: start,
        endDate: end,
        totalDays,
      },
      totalPrice,
      guestsCount,
      specialRequirements: specialRequirements || "",
      contactPerson: contactPerson || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
      },
      status: "pending",
    });

    // Populate service and user details
    const populatedBooking = await Booking.findById(booking._id)
      .populate(
        "service",
        "title category pricePerDay location provider contactInfo"
      )
      .populate("user", "name email phone");

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(populatedBooking);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the request if email fails
    }

    // Update service booking count
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { totalBookings: 1 },
    });

    res.status(201).json(
      ApiResponse.success(
        "Booking created successfully",
        {
          booking: populatedBooking,
        },
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const {
      status,
      startDate,
      endDate,
      serviceId,
      userId,
      page = 1,
      limit = 10,
    } = req.query;

    // build query
    let query = {};

    if (req.user.role === "provider") {
      // Provider can only see bookings of their services
      const providerServices = await Service.find({
        provider: req.user.id,
      }).select("_id");
      const serviceIds = providerServices.map((s) => s._id);
      query.service = { $in: serviceIds };
    }
    if (req.user.role === "admin") {
      // Admin can see all bookings
    }

    if (status) {
      query.status = status;
    }

    if (startDate) {
      query["bookingDates.startDate"] = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query["bookingDates.endDate"] = { $lte: new Date(endDate) };
    }

    if (serviceId) {
      query.service = serviceId;
    }

    if (userId) {
      query.user = userId;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get bookings
    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("service", "title category location provider")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments(query);

    res.status(200).json(
      ApiResponse.success("Bookings retrieved successfully", {
        bookings,
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

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(id)
      .populate("service")
      .populate("user");

    if (!booking) {
      return res.status(404).json(ApiResponse.error("Booking not found", 404));
    }

    // Check authorization
    if (req.user.role === "provider") {
      // Provider can only update bookings for their services
      const isProviderService = booking.service.provider.toString() === userId;
      if (!isProviderService) {
        return res
          .status(403)
          .json(
            ApiResponse.error("Not authorized to update this booking", 403)
          );
      }
    }

    // Validate status transition
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      cancelled: [],
      completed: [],
    };

    const allowedTransitions = validTransitions[booking.status];
    if (!allowedTransitions.includes(status)) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            `Cannot change status from ${booking.status} to ${status}`,
            400
          )
        );
    }

    // Update booking
    booking.status = status;
    if (status === "cancelled" && cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();

    // Send status update email
    try {
      await sendBookingStatusUpdateEmail(booking, status);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res
      .status(200)
      .json(
        ApiResponse.success("Booking status updated successfully", { booking })
      );
  } catch (error) {
    next(error);
  }
};

export const getBookingStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};

    if (req.user.role === "provider") {
      // Provider can only see stats for their services
      const providerServices = await Service.find({
        provider: req.user.id,
      }).select("_id");
      const serviceIds = providerServices.map((s) => s._id);
      matchStage.service = { $in: serviceIds };
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: "$count" },
          totalRevenue: { $sum: "$totalRevenue" },
          byStatus: { $push: { status: "$_id", count: "$count" } },
        },
      },
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          totalRevenue: 1,
          byStatus: 1,
        },
      },
    ]);

    // Get monthly bookings for chart
    const monthlyStats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.status(200).json(
      ApiResponse.success("Statistics retrieved successfully", {
        stats: stats[0] || { totalBookings: 0, totalRevenue: 0, byStatus: [] },
        monthlyStats,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getUpcomingBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();

    let query = {
      "bookingDates.startDate": { $gte: today },
      status: "confirmed",
    };

    // For users, only show their bookings
    if (req.user.role === "user") {
      query.user = userId;
    }

    // For providers, show bookings for their services
    if (req.user.role === "provider") {
      const providerServices = await Service.find({ provider: userId }).select(
        "_id"
      );
      const serviceIds = providerServices.map((s) => s._id);
      query.service = { $in: serviceIds };
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("service", "title category location")
      .sort({ "bookingDates.startDate": 1 })
      .limit(10);

    res
      .status(200)
      .json(
        ApiResponse.success("Upcoming bookings retrieved successfully", {
          bookings,
        })
      );
  } catch (error) {
    next(error);
  }
};
