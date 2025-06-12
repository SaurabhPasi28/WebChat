import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // const login = async (username, password) => {
  //   try {
  //     const data = await loginUser(username, password);
  //     localStorage.setItem('user', JSON.stringify(data));
  //     setUser(data);
  //     // navigate('/');
  //   } catch (err) {
  //     setError(err.message);
  //     throw err;
  //   }
  // };

  // In your login function in AuthContext.jsx
const login = async (username, password) => {
  try {
    const data = await loginUser(username, password);
    const userData = {
      token: data.token,
      userId: data.userId,
      username: data.username
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Connect socket and set online status
    if (socket) {
      socket.emit('userOnline', data.userId);
    }
    navigate('/');
  } catch (err) {
    setError(err.message);
    throw err;
  }
};

  const signup = async (username, password) => {
    try {
      const data = await signupUser(username, password);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    if (socket && user) {
      socket.emit('userOffline', user.userId);
    }
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);