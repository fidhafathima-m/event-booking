import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/emailService.js";
import { storeOTP, verifyOTP, resendOTP } from "../utils/otpCache.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { ApiResponse } from "../utils/responseHandler.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists (verified)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res
        .status(400)
        .json(ApiResponse.error("User already exists for this email", 400));
    }

    // If user exists but not verified, delete it
    if (existingUser && !existingUser.isEmailVerified) {
      await User.findOneAndDelete({ email });
    }

    // Store registration data with OTP in cache (NOT in database)
    const otp = storeOTP(email, {
      name,
      email,
      phone,
      password,
      role: "user",
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      return res
        .status(500)
        .json(ApiResponse.error("Failed to send verification email", 500));
    }

    res.status(200).json(
      ApiResponse.success("OTP sent to email", {
        email: email,
        message: "Please check your email for verification OTP",
      })
    );
  } catch (error) {
    next(error);
  }
};

export const verifyOTPController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP from cache
    const verificationResult = verifyOTP(email, otp);

    if (!verificationResult.valid) {
      return res
        .status(400)
        .json(ApiResponse.error(verificationResult.error, 400));
    }

    // Create user in database after OTP verification
    const user = await User.create({
      name: verificationResult.userData.name,
      email: verificationResult.userData.email,
      phone: verificationResult.userData.phone,
      password: verificationResult.userData.password,
      role: "user",
      isEmailVerified: true,
    });

    // Generate token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in user's document
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Send welcome email
    sendWelcomeEmail(user).catch((emailError) => {
      console.error("Failed to send welcome email:", emailError);
    });

    res
      .status(201)
      .json(
        ApiResponse.success(
          "Email verified successfully",
          { accessToken, refreshToken, user: userResponse },
          201
        )
      );
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res
        .status(400)
        .json(ApiResponse.error("User already exists", 400));
    }
    next(error);
  }
};

export const resendOTPController = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Resend OTP
    const result = resendOTP(email);

    if (!result.success) {
      return res.status(400).json(ApiResponse.error(result.error, 400));
    }

    // Get user data to resend email
    const userData = getRegistrationData(email);

    // Send new OTP email
    try {
      await sendOTPEmail(email, result.otp, userData.name);
    } catch (emailError) {
      return res
        .status(500)
        .json(ApiResponse.error("Failed to resend OTP email", 500));
    }

    res.status(200).json(
      ApiResponse.success("OTP resent successfully", {
        email: email,
        message: "New OTP sent to your email",
      })
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
      return res
        .status(401)
        .json(ApiResponse.error("Invalid credentials", 401));
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json(ApiResponse.error("Please verify your email first", 401));
    }

    // check password
    const isMatchPassword = await user.comparePassword(password);
    if (!isMatchPassword) {
      return res
        .status(401)
        .json(ApiResponse.error("Invalid credentials", 401));
    }

    // generate token
    const token = generateAccessToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(200)
      .json(
        ApiResponse.success(
          "Login successful",
          { token, user: userResponse },
          200
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
    const { name, phone, currentPassword, newPassword } = req.cleanedData; // Use cleanedData from validation middleware
    const userId = req.user.id;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json(ApiResponse.error("User not found", 404));
    }

    // Build update object with only provided fields
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (phone !== undefined) {
      updateData.phone = phone; // Will be null if cleared
    }

    // Handle password change
    if (newPassword) {
      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(ApiResponse.error("Current password is incorrect", 400));
      }

      // Set new password
      user.password = newPassword;
      await user.save();
    }

    // Update other fields if any
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
    }

    // Get updated user
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json(
      ApiResponse.success("Profile updated successfully", {
        user: updatedUser,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json(ApiResponse.error("Refresh token is required", 401));
    }

    // verify refreshToken
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res
        .status(403)
        .json(ApiResponse.error("Invalid or expired refresh token", 403));
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json(ApiResponse.error("User not found", 404));
    }

    // check if the refreshtoken exists there
    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );
    if (!tokenExists) {
      return res
        .status(403)
        .json(ApiResponse.error("Refresh token is not valid", 403));
    }

    // generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj) => tokenObj.token !== refreshToken
    );
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.status(200).json(
      ApiResponse.success("Tokens refreshed successfully", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user.id);
    
    if (refreshToken) {
      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens.filter(
        tokenObj => tokenObj.token !== refreshToken
      );
      await user.save();
    }
    
    res.status(200).json(ApiResponse.success("Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshTokens = [];
    await user.save();

    res.status(200).json(ApiResponse.success("Logged out from all devices"));
  } catch (error) {
    next(error);
  }
};
