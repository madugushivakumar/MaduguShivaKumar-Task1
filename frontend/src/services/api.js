import axios from 'axios';

// Base API URL from environment variable or default fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Prepared for Phase 2 JWT injection)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('joineazy_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired, clean up stored session
    if (error.response?.status === 401) {
      localStorage.removeItem('joineazy_auth_token');
      localStorage.removeItem('joineazy_user_profile');
    }

    const errorData = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      data: error.response?.data,
    };
    return Promise.reject(errorData);
  }
);

export default api;
