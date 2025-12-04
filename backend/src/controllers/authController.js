import User from "../models/User.js";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/emailService.js";
import { storeOTP, verifyOTP, resendOTP } from "../utils/otpCache.js";
import { generateToken } from "../utils/generateToken.js";
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
      return res.status(500).json(
        ApiResponse.error("Failed to send verification email", 500)
      );
    }

    res.status(200).json(
      ApiResponse.success(
        "OTP sent to email",
        { 
          email: email,
          message: "Please check your email for verification OTP" 
        }
      )
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
      return res.status(400).json(
        ApiResponse.error(verificationResult.error, 400)
      );
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
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Send welcome email
    sendWelcomeEmail(user).catch((emailError) => {
      console.error("Failed to send welcome email:", emailError);
    });

    res.status(201).json(
      ApiResponse.success(
        "Email verified successfully",
        { token, user: userResponse },
        201
      )
    );
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json(
        ApiResponse.error("User already exists", 400)
      );
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
      return res.status(400).json(
        ApiResponse.error(result.error, 400)
      );
    }

    // Get user data to resend email
    const userData = getRegistrationData(email);
    
    // Send new OTP email
    try {
      await sendOTPEmail(email, result.otp, userData.name);
    } catch (emailError) {
      return res.status(500).json(
        ApiResponse.error("Failed to resend OTP email", 500)
      );
    }

    res.status(200).json(
      ApiResponse.success(
        "OTP resent successfully",
        { 
          email: email,
          message: "New OTP sent to your email" 
        }
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json(
        ApiResponse.error("Please verify your email first", 401)
      );
    }

    // check password
    const isMatchPassword = await user.comparePassword(password);
    if (!isMatchPassword) {
      return res.status(401).json(ApiResponse.error("Invalid credentials", 401));
    }

    // generate token
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(
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
    const { name, phone } = req.body;
    const userId = req.user.id;

    // fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
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
    res.status(200).json(ApiResponse.success("Logged out successfully"));
  } catch (error) {
    next(error);
  }
};