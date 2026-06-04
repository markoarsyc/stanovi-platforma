import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, AuthResponse } from '../types';
import { Role } from '@/shared/types/enums/role.enum';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInvestor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken) as Record<string, unknown>;
        return { id: decoded.sub as string, email: decoded.email as string, role: decoded.role as typeof Role[keyof typeof Role] };
      } catch { return null; }
    }
    return null;
  });

  const getUserFromToken = (t: string): AuthUser | null => {
    try {
      const decoded = jwtDecode(t) as Record<string, unknown>;
      return {
        id: decoded.sub as string,
        email: decoded.email as string,
        role: decoded.role as typeof Role[keyof typeof Role],
      };
    } catch {
      return null;
    }
  };

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
      isAuthenticated: !!token,
      isInvestor: user?.role === Role.INVESTOR,
      isAdmin: user?.role === Role.ADMIN,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};