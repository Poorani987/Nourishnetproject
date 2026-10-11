import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthResponse } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<User>;
  register: (details: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getDashboardPath: (role?: Role) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
  }, [token]);

  const handleAuthSuccess = (res: AuthResponse): User => {
    const authUser: User = {
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

  const login = async (credentials: any): Promise<User> => {
    const res = await authApi.login(credentials);
    return handleAuthSuccess(res);
  };

  const register = async (details: any): Promise<User> => {
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

  const getDashboardPath = (role?: Role): string => {
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
