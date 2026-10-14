import axios from 'axios';

// Create configured Axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Bearer JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages uniformly
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // The request was made and the server responded with a status code
      message = error.response.data?.message || message;
      
      // Auto-logout on 401 Unauthorized if token expired
      if (error.response.status === 401 && localStorage.getItem('jobconnect_token')) {
        // Optional: emit event or let AuthContext handle state
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g. server down)
      message = 'Cannot connect to JobConnect server. Please check your network or server status.';
    }

    const enhancedError = new Error(message);
    enhancedError.statusCode = error.response?.status;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);

export default api;
