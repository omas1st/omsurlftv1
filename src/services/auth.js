// src/services/auth.js
import { api } from './api';

export const authService = {
  // Register new user - FIXED VERSION
  register: async (userData) => {
    try {
      console.log('Registering user:', { ...userData, password: '***' });
      const response = await api.post('/auth/register', userData);
      
      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      console.error('Registration error details:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        field: error.response?.data?.field,
        error: error.message
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  // Forgot password
  forgotPassword: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process request'
      };
    }
  },

  // Reset password
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set token
  setToken: (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token verification failed'
      };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/refresh', { refreshToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return {
        success: true,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed'
      };
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      const response = await api.post('/auth/change-password', data);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password'
      };
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/auth/account', { data: { password } });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account'
      };
    }
  },

  // Admin login
  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/auth/admin/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Admin login failed'
      };
    }
  }
};

export default authService;