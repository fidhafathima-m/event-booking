import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/emailService.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiResponse } from "../utils/ResponseHandler.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json(ApiResponse.error("User already exists for this email", 400));
    }

    // create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "user",
    });

    // generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    sendWelcomeEmail(user).catch((emailError) => {
      console.error("Failed to send welcome email:", emailError);
    });

    res
      .status(201)
      .json(
        ApiResponse.success(
          "User registered successfully",
          { token, user: userResponse },
          201
        )
      );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check for user email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json(ApiResponse.error("Invalid credentials", 401));
    }

    // check password
    const isMatchPassword = await user.comparePassword(password);
    if (!isMatchPassword) {
      return res.status(401).json(ApiResponse.error("Password not match", 401));
    }

    // generate token
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json(
        ApiResponse.success(
          "Login successfull",
          { token, user: userResponse },
          201
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res
      .status(200)
      .json(ApiResponse.success("User retrieved successfully", { user }));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    // fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidations: true,
    }).select("-password");
    res
      .status(200)
      .json(ApiResponse.success("Profile updated successfully", { user }));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, we can't invalidate token server-side
    // Client should remove the token
    res.status(200).json(ApiResponse.success("Logged out successfully"));
  } catch (error) {
    next(error);
  }
};
