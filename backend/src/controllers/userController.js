import Booking from "../models/Booking.js";
import { ApiResponse } from "../utils/responseHandler.js";

export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    // pagination
    const skip = (page - 1) * limit;

    // get bookings
    const bookings = await Booking.find(query)
      .populate("service", "title category pricePerDay location images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // count for pagination
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

export const getBookingsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, user: userId })
      .populate(
        "service",
        "title category pricePerDay location images contactinfo"
      )
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json(ApiResponse.error("Booking not found", 404));
    }

    res
      .status(200)
      .json(ApiResponse.success("Booking retrieved successfully", { booking }));
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json(ApiResponse.error("Booking not found", 404));
    }

    // check if status can be cancelled
    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json(ApiResponse.error("Booking already cancelled", 400));
    }

    if (booking.status === "completed") {
      return res
        .status(400)
        .json(ApiResponse.error("Completed bookings cannot be cancelled", 400));
    }

    // update booking status
    booking.status = "cancelled";
    booking.cancellationReason = cancellationReason || "";
    await booking.save();

    if (booking.status === "completed") {
      return res
        .status(400)
        .json(ApiResponse.error("Completed bookings cannot be cancelled", 400));
    }
  } catch (error) {
    next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // get booking counts
    const totalBookings = await Booking.countDocuments({ user: userId });
    const upcomingBookings = await Booking.countDocuments({
      user: userId,
      status: "confirmed",
      "bookingsDates.startDate": { $gt: new Date() },
    });
    const pastBookings = await Bookings.countDocuments({
      user: userId,
      status: "completed",
    });
    const recentBookings = await Booking.countDocuments({
      user: userId,
    })
      .populate("service", "title category")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json(
      ApiResponse.success("Dashboard data retrieved successfully", {
        stats: {
          totalBookings,
          upcomingBookings,
          pastBookings,
        },
        recentBookings,
      })
    );
  } catch (error) {
    next(error);
  }
};
