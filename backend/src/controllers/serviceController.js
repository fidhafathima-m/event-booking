import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import {ApiResponse} from "../utils/responseHandler.js"

// Helper function to build filter query
const buildFilterQuery = (queryParams) => {
  const {
    category,
    minPrice,
    maxPrice,
    location,
    startDate,
    endDate,
    search,
    provider,
  } = queryParams;

  let query = { isActive: true };

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Location filter
  if (location) {
    query.location = new RegExp(location, "i");
  }

  // Provider filter
  if (provider) {
    query.provider = provider;
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Date availability filter
  if (startDate || endDate) {
    query.availability = {
      $elemMatch: {
        isAvailable: true,
      },
    };
    if (startDate) {
      query.availability.$elemMatch.date = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.availability.$elemMatch.date = { $lte: new Date(endDate) };
    }
  }

  return query;
};

export const getServices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      ...filters
    } = req.query;

    // build filter query
    const query = buildFilterQuery(filters);

    // pagination
    const skip = (page - 1) * limit;

    // determine sort order
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = {};
    sortObj[sort] = sortOrder;

    // get services
    const services = await Service.find(query)
      .populate("provider", "name email phone")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

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
        filters,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate(
      "provider",
      "name email phone profileImage"
    );

    if (!service) {
      return res.status(404).json(ApiResponse.error("Service not found", 404));
    }

    // get service availabilty for next 30 days
    let next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const availability = await Booking.find({
      service: id,
      status: { $in: ["confirmed", "pending"] },
      "bookingDates.endDate": { $gte: new Date() },
      "bookingDates.startDate": { $lte: next30Days },
    }).select("bookingDates status");

    res.status(200).json(
      ApiResponse.success("Service retrieved successfully", {
        service,
        availability,
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

    // Check if user is provider or admin
    if (req.user.role === "user") {
      return res
        .status(403)
        .json(
          ApiResponse.error("Only providers or admins can create services", 403)
        );
    }

    serviceData.provider = userId;

    // ceate service
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

    if (
      req.user.role === "provider" &&
      service.provider.toString() !== userId
    ) {
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

    // check ownership
    if (
      req.user.role === "provider" &&
      service.provider.toString() !== userId
    ) {
      return res
        .status(403)
        .json(ApiResponse.error("Not authorized to delete this service", 403));
    }

    // soft delete service
    service.isActive = false;
    await Service.save();

    res.status(200).json(ApiResponse.success("Service deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    // Validate dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json(ApiResponse.error("Please provide start and end dates", 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json(ApiResponse.error("End date must be after start date", 400));
    }

    const existingBookings = await Booking.find({
      service: id,
      status: { $in: ["confirmed", "pending"] },
      $or: [
        {
          "bookingDates.startDate": { $lte: end },
          "bookingDates.endDate": { $gte: start },
        },
      ],
    });

    const isAvailable = existingBookings.length === 0;

    // calculate total price if available
    const service = await Service.findById(id);
    const totalDays = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
    const totalPrice =
      isAvailable && service ? service.pricePerDay * totalDays : 0;

    res.status(200).json(
      ApiResponse.success("Availability checked successfully", {
        isAvailable,
        totalDays,
        totalPrice,
        conflictingBookings: existingBookings.length,
      })
    );
  } catch (error) {
    next(error);
  }
};
