import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    }, 
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and token expired, try to refresh
    if (error.response?.status === 401 && 
        error.response?.data?.code === "TOKEN_EXPIRED" &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await api.post("/auth/refresh-token", { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Store new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401) {
      // Other 401 errors, logout user
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;