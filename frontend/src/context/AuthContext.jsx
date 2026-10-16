import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
  }, [token]);

  const handleAuthSuccess = (res) => {
    const authUser = {
      id: res.id,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      address: res.address,
      city: res.city,
      state: res.state,
      pincode: res.pincode,
      latitude: res.latitude,
      longitude: res.longitude,
      profileDetails: res.profileDetails,
    };
    setUser(authUser);
    setToken(res.token);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(authUser));
    return authUser;
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    return handleAuthSuccess(res);
  };

  const register = async (details) => {
    const res = await authApi.register(details);
    return handleAuthSuccess(res);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      handleAuthSuccess(res);
    } catch {
      logout();
    }
  };

  const getDashboardPath = (role) => {
    const userRole = role || user?.role;
    switch (userRole) {
      case 'DONOR':
        return '/donor';
      case 'RECIPIENT':
        return '/recipient';
      case 'VEHICLE_VOLUNTEER':
        return '/volunteer';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
        getDashboardPath,
      }}
    >
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
