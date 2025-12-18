import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export const registerStep1 = createAsyncThunk(
  "auth/registerStep1",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
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
      const { accessToken, refreshToken } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

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
      const { accessToken, refreshToken } = response.data.data;

      toast.success("Login successful!");

      // Store token in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      return rejectWithValue({
        message: errorMessage,
        error: error.response?.data,
      });
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
  async (_, { rejectWithValue, getState }) => {
    try {
      const refreshToken = getState().auth.refreshToken;
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const refreshTokens = createAsyncThunk(
  "auth/refreshTokens",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState().auth;
      const refreshToken = state.refreshToken;
      
      // Add check for existing refresh operation
      if (state.isRefreshing) {
        return rejectWithValue({ message: "Refresh already in progress" });
      }
      
      const response = await api.post("/auth/refresh-token", { refreshToken });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Store new tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      
      return response.data;
    } catch (error) {
      // If refresh fails, logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = '/login';
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  user: null,
  tempUser: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isLoading: false,
  isRefreshing: false,
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
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
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
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
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
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
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
        state.errorMessage = action.payload?.message || "Failed to load profile";
      })
      // Refresh Tokens
      .addCase(refreshTokens.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.isRefreshing = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Failed to refresh tokens";
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tempUser = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear local state even if API call fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tempUser = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      });
  },
});

export const { reset, setCredentials, clearTempUser } = authSlice.actions;
export default authSlice.reducer;
