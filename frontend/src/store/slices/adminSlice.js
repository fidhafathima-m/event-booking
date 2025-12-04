import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

// Async thunks for admin operations
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch admin stats');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllServices = createAsyncThunk(
  'admin/fetchAllServices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching services with filters:', filters);
      const params = new URLSearchParams(filters).toString();
      const url = `/admin/services?${params}`;
      console.log('Making request to:', url);
      
      const response = await api.get(url);
      console.log('Response received:', response.status, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch services';
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data);
    }
  }
);
export const toggleServiceStatus = createAsyncThunk(
  'admin/toggleServiceStatus',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/services/${serviceId}/toggle-active`);
      toast.success('Service status updated');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service status');
      return rejectWithValue(error.response?.data);
    }
  }
);

// FIXED: Use /admin/services instead of /services
export const createService = createAsyncThunk(
  'admin/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/services', serviceData);
      toast.success('Service created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateService = createAsyncThunk(
  'admin/updateService',
  async ({ serviceId, serviceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/services/${serviceId}`, serviceData);
      toast.success('Service updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service');
      return rejectWithValue(error.response?.data);
    }
  }
);

// FIXED: Use /admin/services instead of /services
export const deleteService = createAsyncThunk(
  'admin/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/services/${serviceId}`);
      toast.success('Service deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'admin/fetchAllBookings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/bookings?${params}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'admin/updateBookingStatus',
  async ({ bookingId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, { 
        status, 
        cancellationReason: reason 
      });
      toast.success('Booking status updated');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  services: [],
  bookings: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: ''
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
    },
    clearAdminData: (state) => {
      state.stats = null;
      state.users = [];
      state.services = [];
      state.bookings = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload.data;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to fetch stats';
      })
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.data.users;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to fetch users';
      })
      // Fetch all services
      .addCase(fetchAllServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.services = action.payload.data.services;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchAllServices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to fetch services';
      })
      // Fetch all bookings
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data.bookings;
        state.pagination = action.payload.data.pagination;
      })
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.data.user;
        const index = state.users.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      // Toggle service status
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        const updatedService = action.payload.data.service;
        const index = state.services.findIndex(service => service._id === updatedService._id);
        if (index !== -1) {
          state.services[index] = updatedService;
        }
      })
      // Create service
      .addCase(createService.fulfilled, (state, action) => {
        const newService = action.payload.data.service;
        state.services.unshift(newService);
        state.pagination.total += 1;
      })
      // Update service
      .addCase(updateService.fulfilled, (state, action) => {
        const updatedService = action.payload.data.service;
        const index = state.services.findIndex(service => service._id === updatedService._id);
        if (index !== -1) {
          state.services[index] = updatedService;
        }
      })
      // Delete service
      .addCase(deleteService.fulfilled, (state, action) => {
        // Remove deleted service from state
        const serviceId = action.meta.arg;
        state.services = state.services.filter(service => service._id !== serviceId);
        state.pagination.total -= 1;
      });
  }
});

export const { reset, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;