import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${backendBase}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-restore session on mount by checking HttpOnly cookie via GET /users/me
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  // Register handler (Always creates Student)
  const register = async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Update profile handler (PATCH /users/me)
  const updateUserProfile = async (profileData) => {
    const response = await api.patch('/users/me', profileData);
    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  // Upload avatar image handler (PATCH /users/me/avatar using FormData)
  const updateUserAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    updateUserAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
