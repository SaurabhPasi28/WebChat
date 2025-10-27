import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: '/api',
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