const otpCache = new Map();

export const storeOTP = (email, data) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  const cacheData = {
    ...data,
    otp,
    expiresAt,
    attempts: 0,
  };
  
  otpCache.set(email, cacheData);
  
  // Auto cleanup after expiry
  setTimeout(() => {
    if (otpCache.get(email)?.expiresAt <= Date.now()) {
      otpCache.delete(email);
    }
  }, 10 * 60 * 1000);
  
  return otp;
};

export const verifyOTP = (email, otpCode) => {
  const data = otpCache.get(email);
  
  if (!data) {
    return { valid: false, error: 'OTP expired or not found' };
  }
  
  if (Date.now() > data.expiresAt) {
    otpCache.delete(email);
    return { valid: false, error: 'OTP expired' };
  }
  
  if (data.otp !== otpCode) {
    data.attempts += 1;
    
    if (data.attempts >= 5) {
      otpCache.delete(email);
      return { valid: false, error: 'Too many attempts. OTP expired' };
    }
    
    return { valid: false, error: 'Invalid OTP', attempts: data.attempts };
  }
  
  // OTP is valid, remove from cache
  otpCache.delete(email);
  
  return { 
    valid: true, 
    userData: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    }
  };
};

export const resendOTP = (email) => {
  const data = otpCache.get(email);
  
  if (!data) {
    return { success: false, error: 'Registration session expired' };
  }
  
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  data.otp = newOtp;
  data.expiresAt = Date.now() + 10 * 60 * 1000; // Reset to 10 minutes
  data.attempts = 0;
  
  otpCache.set(email, data);
  
  return { success: true, otp: newOtp };
};

export const getRegistrationData = (email) => {
  return otpCache.get(email);
};