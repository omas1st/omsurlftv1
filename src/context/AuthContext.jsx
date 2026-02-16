import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authService } from '../services/auth';
import socketService from '../services/socket'; // ✅ Socket management

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        socketService.disconnect(); // ✅ ensure disconnected
        return;
      }

      const result = await authService.verifyToken();

      if (result.success) {
        setUser(result.user);
        socketService.connect(token); // ✅ Connect socket after successful auth
      } else {
        // Token is invalid, logout
        authService.logout();
        socketService.disconnect(); // ✅ ensure disconnected
      }
    } catch (err) {
      console.error('Auth check error:', err);
      authService.logout();
      socketService.disconnect(); // ✅ ensure disconnected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login(credentials);

      if (result.success) {
        setUser(result.user);
        // ✅ Connect socket after successful login
        socketService.connect(localStorage.getItem('token'));
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('AuthContext: Registering user:', { ...userData, password: '***' });
      const result = await authService.register(userData);
      console.log('AuthContext: Registration result:', result);

      if (result.success) {
        setUser(result.user);
        // ✅ Connect socket after successful registration
        socketService.connect(localStorage.getItem('token'));
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return {
          success: false,
          message: result.message,
          field: result.field,
        };
      }
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      setError('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    socketService.disconnect(); // ✅ CRITICAL – prevent memory leaks
  };

  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: 'Update failed' };
    }
  };

  const changePassword = async (data) => {
    try {
      const result = await authService.changePassword(data);
      return result;
    } catch (err) {
      return { success: false, message: 'Password change failed' };
    }
  };

  const deleteAccount = async (password) => {
    try {
      const result = await authService.deleteAccount(password);

      if (result.success) {
        logout();
      }

      return result;
    } catch (err) {
      return { success: false, message: 'Account deletion failed' };
    }
  };

  const refreshUser = async () => {
    try {
      const result = await authService.getProfile();

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }

      return { success: false, message: result.message };
    } catch (err) {
      return { success: false, message: 'Failed to refresh user data' };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isPremium: user?.tier === 'premium' || user?.tier === 'enterprise',
    isRestricted: user?.isRestricted || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};