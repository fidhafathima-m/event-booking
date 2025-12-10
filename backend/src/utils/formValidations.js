import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "./validators.js";

export const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = {};

  // Validate each field
  const nameValidation = validateName(name, true);
  if (!nameValidation.isValid) errors.name = nameValidation.error;

  const emailValidation = validateEmail(email, true);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  const passwordValidation = validatePassword(password, {
    personalInfo: { name, email },
  });
  if (!passwordValidation.isValid) errors.password = passwordValidation.error;

  if (phone) {
    const phoneValidation = validatePhone(phone, false);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.error;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Add cleaned values to request
  req.cleanedData = {
    name: nameValidation.cleanValue,
    email: emailValidation.cleanValue,
    password: password,
    phone: phone ? phoneValidation.cleanValue : null,
  };

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  const emailValidation = validateEmail(email, true);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  if (!password) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.cleanedData = {
    email: emailValidation.cleanValue,
    password,
  };

  next();
};

// utils/formValidations.js

export const validateProfileUpdate = (req, res, next) => {
  const { name, phone, currentPassword, newPassword } = req.body;
  const errors = {};

  // Validate name if provided and not empty string
  if (name !== undefined && name !== null && name !== "") {
    const nameValidation = validateName(name, true);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
    }
  }

  // Validate phone if provided and not empty string
  if (phone !== undefined && phone !== null && phone !== "") {
    const phoneValidation = validatePhone(phone, false);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
    }
  }

  // Validate password change if newPassword is provided
  if (newPassword) {
    if (!currentPassword) {
      errors.currentPassword = "Current password is required to change password";
    } else {
      // Get user's current name/email for password validation
      const userName = name || req.user?.name || "";
      const userEmail = req.user?.email || "";
      
      const passwordValidation = validatePassword(newPassword, {
        personalInfo: { name: userName, email: userEmail },
      });
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.error;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Prepare cleaned data - only include fields that were provided
  const cleanedData = {};
  
  if (name !== undefined && name !== null && name !== "") {
    const nameValidation = validateName(name, true);
    if (nameValidation.isValid && nameValidation.cleanValue) {
      cleanedData.name = nameValidation.cleanValue;
    } else {
      cleanedData.name = name;
    }
  }
  
  if (phone !== undefined && phone !== null) {
    if (phone === "") {
      // Allow empty string to clear phone number
      cleanedData.phone = null;
    } else {
      const phoneValidation = validatePhone(phone, false);
      if (phoneValidation.isValid && phoneValidation.cleanValue) {
        cleanedData.phone = phoneValidation.cleanValue;
      } else {
        cleanedData.phone = phone;
      }
    }
  }
  
  if (currentPassword) {
    cleanedData.currentPassword = currentPassword;
  }
  
  if (newPassword) {
    cleanedData.newPassword = newPassword;
  }

  req.cleanedData = cleanedData;
  next();
};