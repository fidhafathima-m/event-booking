import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export const registerStep1 = createAsyncThunk(
  "auth/registerStep1",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      toast.success("OTP sent to your email!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-otp", otpData);
      const { token } = response.data.data;
      
      toast.success("Email verified successfully!");
      
      // Store token in localStorage
      localStorage.setItem("token", token);
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/resend-otp", data);
      toast.success("New OTP sent!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", userData);
      const { token } = response.data.data;
      
      toast.success("Login successful!");
      
      // Store token in localStorage
      localStorage.setItem("token", token);
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/update-profile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/update-profile", userData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  user: null,
  tempUser: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = "";
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearTempUser: (state) => {
      state.tempUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Step 1
      .addCase(registerStep1.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerStep1.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tempUser = { email: action.payload.data.email };
      })
      .addCase(registerStep1.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Registration failed";
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.tempUser = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "OTP verification failed";
      })
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Failed to resend OTP";
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Login failed";
      })
      // Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load profile";
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.tempUser = null;
        localStorage.removeItem("token");
      });
  },
});

export const { reset, setCredentials, clearTempUser } = authSlice.actions;
export default authSlice.reducer;