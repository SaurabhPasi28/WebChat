import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Use environment variable for API URL
// In production (Vercel), this should be your Render backend URL
// In development, it will use the local backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add request interceptor
api.interceptors.request.use((config) => {
  // Get token from localStorage - it's stored in 'user' object
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      const token = user.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // Handle unauthorized - possibly logout user
    const { logout } = useAuth();
    logout();
    window.location.href = '/';
  }
  return Promise.reject(error);
});

export default api;