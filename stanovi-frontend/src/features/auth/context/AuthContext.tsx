import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, AuthResponse } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  const getUserFromToken = (t: string): AuthUser | null => {
    try {
      const decoded: any = jwtDecode(t);
      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const decodedUser = getUserFromToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        logout();
      }
    }
  }, [token]);

  const login = (data: AuthResponse) => {
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
    const decodedUser = getUserFromToken(data.access_token);
    setUser(decodedUser);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};