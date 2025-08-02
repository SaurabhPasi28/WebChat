import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useSocket } from '../services/socket.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();
  
  const { socket, isConnected, connect } = useSocket();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if token is expired
          if (parsedUser?.expiresAt && Date.now() > parsedUser.expiresAt) {
            localStorage.removeItem('user');
            setUser(null);
          } else {
            setUser(parsedUser);
            
            // Validate token on initial load
            if (parsedUser?.token) {
              try {
                await validateToken(parsedUser.token);
              } catch (err) {
                console.error('Token validation failed:', err);
                logout();
              }
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle socket connection when user is authenticated
  useEffect(() => {
    if (user && socket && isConnected) {
      // Join user's room and set online status
      socket.emit('join', user.userId);
      socket.emit('userOnline', user.userId);
    }
  }, [user, socket, isConnected]);

  const validateToken = async (token) => {
    try {
      // You can add a token validation endpoint here
      // For now, we'll just check if the token exists
      if (!token) {
        throw new Error('No token provided');
      }
      return true;
    } catch (error) {
      throw new Error('Token validation failed');
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authAPI.login(username, password);
      
      const userData = {
        token: data.token,
        userId: data.userId,
        username: data.username,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Connect socket after successful login
      console.log('Login successful, connecting socket for user:', userData.userId);
      connect(userData.userId);
      
      // Navigate to chat
      // navigate('/');
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authAPI.signup(username, password);
      
      const userData = {
        token: data.token,
        userId: data.userId,
        username: data.username,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Connect socket after successful signup
      console.log('Signup successful, connecting socket for user:', userData.userId);
      connect(userData.userId);
      
      // Navigate to chat
      // navigate('/');
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    console.log('Logging out user...');
    
    // Clear user data
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    
    // Navigate to login
    // navigate('/login');
    
    // Reload the page to reset all state
    window.location.href = '/login';
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};