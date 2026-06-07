import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, AuthResponse } from '../types';
import { Role } from '@/shared/types/enums/role.enum';
import { tokenStorage } from '@/shared/utils/storage';

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

const decodeUser = (t: string): AuthUser | null => {
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialToken = tokenStorage.get();
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<AuthUser | null>(() =>
    initialToken ? decodeUser(initialToken) : null,
  );

  const login = (data: AuthResponse) => {
    tokenStorage.set(data.access_token);
    setToken(data.access_token);
    setUser(decodeUser(data.access_token));
  };

  const logout = () => {
    tokenStorage.clear();
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
