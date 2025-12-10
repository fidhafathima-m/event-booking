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

// Enhanced name validation
export const validateName = (name) => {
  if (!name.trim()) return "Name is required";

  // Remove extra spaces
  const cleanName = name.replace(/\s+/g, " ").trim();

  if (cleanName.length < 2) return "Name must be at least 2 characters";
  if (cleanName.length > 50) return "Name cannot exceed 50 characters";

  // Allow letters, spaces, hyphens, apostrophes (international names)
  if (!/^[A-Za-z\s\u00C0-\u017F\-'.]+$/.test(cleanName)) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }

  // Check for multiple consecutive special characters
  if (/[-']{2,}/.test(cleanName)) {
    return "Cannot have consecutive special characters";
  }

  // Check for valid name structure (should start and end with letter)
  if (!/^[A-Za-z\u00C0-\u017F]/.test(cleanName)) {
    return "Name must start with a letter";
  }

  if (!/[A-Za-z\u00C0-\u017F]$/.test(cleanName)) {
    return "Name must end with a letter";
  }

  return "";
};

// Enhanced email validation
export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) return "Please enter a valid email address";

  // Check email length
  if (email.length > 254) return "Email is too long";

  return "";
};

// Enhanced phone validation
export const validatePhone = (phone) => {
  if (!phone.trim()) return ""; // Phone is optional

  // Remove all non-digit characters except leading +
  const cleanPhone = phone.replace(/\s+/g, "");

  // Check for invalid characters
  if (!/^[\d\s+()-]*$/.test(phone)) {
    return "Phone number can only contain digits, spaces, +, -, (, )";
  }

  // Extract digits only for length validation
  const digitsOnly = cleanPhone.replace(/\D/g, "");

  // International phone number validation (E.164 format)
  if (cleanPhone.startsWith("+")) {
    // For international numbers with country code
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return "International phone number must be 8-15 digits (including country code)";
    }
  } else {
    // For local numbers (assuming US format as example)
    if (digitsOnly.length < 10 || digitsOnly.length > 10) {
      return "Phone number must be 10 digits";
    }
  }

  return "";
};

// Enhanced password validation
export const validatePassword = (password) => {
  if (!password) return "Password is required";

  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password cannot exceed 128 characters";

  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&* etc.)";
  }

  // Check for common patterns
  if (/(password|123456|qwerty|admin|welcome)/i.test(password)) {
    return "Password is too common. Please choose a stronger one";
  }

  // Check for sequential characters
  if (
    /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
      password
    )
  ) {
    return "Password contains sequential characters";
  }

  // Check for repeating characters
  if (/(.)\1{2,}/.test(password)) {
    return "Password contains repeating characters";
  }

  return "";
};
