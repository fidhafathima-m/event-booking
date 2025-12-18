export const checkPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, message: "", color: "text-gray-500" };
  }

  let score = 0;
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    noSequential:
      !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
        password
      ),
    noRepeating: !/(.)\1{2,}/.test(password),
  };

  Object.values(requirements).forEach((met) => {
    if (met) score++;
  });

  let message = "";
  let color = "";

  if (score >= 6) {
    message = "Strong password ✓";
    color = "text-green-600";
  } else if (score >= 4) {
    message = "Medium password - Consider adding more requirements";
    color = "text-yellow-600";
  } else if (score >= 2) {
    message = "Weak password - Needs improvement";
    color = "text-orange-600";
  } else {
    message = "Very weak password";
    color = "text-red-600";
  }

  return { score, message, color };
};

// Enhanced email validation
export const validateEmail = (email, isRequired = true) => {
  if (!email && !isRequired) {
    return { isValid: true, cleanValue: "" };
  }
  
  if (!email || !email.trim()) {
    return { isValid: false, error: "Email is required" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  // Check email length
  if (cleanEmail.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }

  return { isValid: true, cleanValue: cleanEmail };
};


// Update the validator functions to return objects with isValid, error, and cleanValue

export const validateName = (name, isRequired = true) => {
  if (!name && !isRequired) {
    return { isValid: true, cleanValue: "" };
  }
  
  if (!name || !name.trim()) {
    return { isValid: false, error: "Name is required" };
  }

  // Remove extra spaces
  const cleanName = name.replace(/\s+/g, " ").trim();

  if (cleanName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters" };
  }
  
  if (cleanName.length > 50) {
    return { isValid: false, error: "Name cannot exceed 50 characters" };
  }

  // Allow letters, spaces, hyphens, apostrophes (international names)
  if (!/^[A-Za-z\s\u00C0-\u017F\-'.]+$/.test(cleanName)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }

  // Check for multiple consecutive special characters
  if (/[-']{2,}/.test(cleanName)) {
    return { isValid: false, error: "Cannot have consecutive special characters" };
  }

  // Check for valid name structure (should start and end with letter)
  if (!/^[A-Za-z\u00C0-\u017F]/.test(cleanName)) {
    return { isValid: false, error: "Name must start with a letter" };
  }

  if (!/[A-Za-z\u00C0-\u017F]$/.test(cleanName)) {
    return { isValid: false, error: "Name must end with a letter" };
  }

  return { isValid: true, cleanValue: cleanName };
};

export const validatePhone = (phone, isRequired = false) => {
  if (!phone && !isRequired) {
    return { isValid: true, cleanValue: null };
  }
  
  if (phone === "" && !isRequired) {
    return { isValid: true, cleanValue: null };
  }

  if (!phone || !phone.trim()) {
    return { isValid: false, error: "Phone is required" };
  }

  // Remove all non-digit characters except leading +
  const cleanPhone = phone.replace(/\s+/g, "");

  // Check for invalid characters
  if (!/^[\d\s+()-]*$/.test(phone)) {
    return { isValid: false, error: "Phone number can only contain digits, spaces, +, -, (, )" };
  }

  // Extract digits only for length validation
  const digitsOnly = cleanPhone.replace(/\D/g, "");

  // International phone number validation (E.164 format)
  if (cleanPhone.startsWith("+")) {
    // For international numbers with country code
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return { isValid: false, error: "International phone number must be 8-15 digits (including country code)" };
    }
  } else {
    // For local numbers
    if (digitsOnly.length < 10 || digitsOnly.length > 10) {
      return { isValid: false, error: "Phone number must be 10 digits" };
    }
  }

  // Return cleaned phone (digits only for storage)
  return { isValid: true, cleanValue: digitsOnly };
};

export const validatePassword = (password, options = {}) => {
  const { personalInfo = {} } = options;
  
  if (!password) {
    return { isValid: false, error: "Password is required", cleanValue: null };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters", cleanValue: null };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password cannot exceed 128 characters", cleanValue: null };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter", cleanValue: null };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter", cleanValue: null };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number", cleanValue: null };
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character (!@#$%^&* etc.)", cleanValue: null };
  }

  // Check for common patterns
  if (/(password|123456|qwerty|admin|welcome)/i.test(password)) {
    return { isValid: false, error: "Password is too common. Please choose a stronger one", cleanValue: null };
  }

  // Check for sequential characters
  if (
    /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
      password
    )
  ) {
    return { isValid: false, error: "Password contains sequential characters", cleanValue: null };
  }

  // Check for repeating characters
  if (/(.)\1{2,}/.test(password)) {
    return { isValid: false, error: "Password contains repeating characters", cleanValue: null };
  }

  // Check for personal information
  if (personalInfo.name) {
    const firstName = personalInfo.name.toLowerCase().split(' ')[0];
    if (firstName && password.toLowerCase().includes(firstName)) {
      return { isValid: false, error: "Password should not contain your name", cleanValue: null };
    }
  }

  if (personalInfo.email) {
    const emailLocal = personalInfo.email.split('@')[0].toLowerCase();
    if (emailLocal && password.toLowerCase().includes(emailLocal)) {
      return { isValid: false, error: "Password should not contain your email", cleanValue: null };
    }
  }

  return { isValid: true, cleanValue: password };
};