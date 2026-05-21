import axios from 'axios';

// Create a production-level centralized Axios client instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Explicit automated request interceptor
// Checks for access token in localStorage and appends it to Authorization header
api.interceptors.request.use(
  (config) => {
    // Attempt to retrieve token directly
    let token = localStorage.getItem('token');
    
    // Fallback: check if the token is stored inside a 'userInfo' or 'user' JSON object
    if (!token) {
      const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('user');
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          token = parsedUser.token;
        } catch (error) {
          // Silently ignore JSON parsing errors for safety
        }
      }
    }

    // Append the Bearer token to the HTTP authorization header if present
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage completely on unauthorized attempts
      localStorage.clear();
      
      // Route unauthorized attempts back to the login layout
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
