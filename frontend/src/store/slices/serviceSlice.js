import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/services?${params}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch services');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch service');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/services', serviceData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'services/checkAvailability',
  async ({ id, dates }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/services/${id}/check-availability`, dates);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check availability');
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  services: [],
  service: null,
  availability: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  },
  filterOptions: null,
  filters: {},
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: ''
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearService: (state) => {
      state.service = null;
      state.availability = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.services = action.payload.data.services;
        state.pagination = action.payload.data.pagination;
        state.filterOptions = action.payload.data.filterOptions;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to fetch services';
      })
      // Fetch service by ID
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.service = action.payload.data.service;
        state.availability = action.payload.data.availability;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Failed to fetch service';
      })
      // Check availability
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.availability = action.payload.data;
      });
  }
});

export const { reset, setFilters, clearService } = serviceSlice.actions;
export default serviceSlice.reducer;