import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import toast from "react-hot-toast";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      toast.success("Registration successfull");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", userData);
      toast.success("Login successfull");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data.message || "Login failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout");
      toast.success("Logged out successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data.message || "Logout failed");
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  user: null,
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
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || "Registration failed";
      }) // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        localStorage.setItem("token", action.payload.data.token);
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
        localStorage.removeItem("token");
      });
  },
});

export const {reset, setCredentials} = authSlice.actions;
export default authSlice.reducer;