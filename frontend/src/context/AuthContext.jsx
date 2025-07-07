import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './auth';

// Secure token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize axios with secure defaults
  axios.defaults.withCredentials = true; // Enable sending cookies
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // Add request interceptor for JWT token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for error handling
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Handle token expiration
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  const secureStorage = {
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },
    getItem: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? (item.startsWith('{') ? JSON.parse(item) : item) : null;
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
    }
  };

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = secureStorage.getItem(TOKEN_KEY);
      const storedUser = secureStorage.getItem(USER_KEY);
      
      if (token && storedUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(storedUser);
        try {
          await fetchUserProfile();
        } catch (error) {
          console.error('Error validating stored session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/profile');
      const userData = response.data;
      secureStorage.setItem(USER_KEY, userData);
      setUser(userData);
      return userData;
    } catch (error) {
      secureStorage.removeItem(TOKEN_KEY);
      secureStorage.removeItem(USER_KEY);
      delete axios.defaults.headers.common['Authorization'];
      throw error;
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/users/login', credentials);
      const { token, user: userData } = response.data;
      
      secureStorage.setItem(TOKEN_KEY, token);
      secureStorage.setItem(USER_KEY, userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error durante el inicio de sesión';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/users/register', userData);
      const { token, user: newUser } = response.data;
      
      secureStorage.setItem(TOKEN_KEY, token);
      secureStorage.setItem(USER_KEY, newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(newUser);
      
      return newUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error durante el registro';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout,
        fetchUserProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
