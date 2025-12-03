// src/store/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bookings', bookingData);
      toast.success('Booking created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/users/bookings?${params}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/bookings/${id}/cancel`, { cancellationReason: reason });
      toast.success('Booking cancelled successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchUpcomingBookings = createAsyncThunk(
  'bookings/fetchUpcomingBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/upcoming');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAllBookings',
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
  'bookings/updateBookingStatus',
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { 
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
  bookings: [],
  upcomingBookings: [],
  booking: null,
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

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
    },
    clearBooking: (state) => {
      state.booking = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.booking = action.payload.data.booking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to create booking';
      })
      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings = action.payload.data.bookings;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to fetch bookings';
      })
      // Fetch upcoming bookings
      .addCase(fetchUpcomingBookings.fulfilled, (state, action) => {
        state.upcomingBookings = action.payload.data.bookings;
      })
      // Fetch all bookings (admin)
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data.bookings;
        state.pagination = action.payload.data.pagination;
      });
  }
});

export const { reset, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;