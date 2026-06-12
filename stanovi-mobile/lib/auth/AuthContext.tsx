import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getToken, removeToken, setToken } from '@/lib/storage/token';

export type Role = 'BUYER' | 'INVESTOR' | 'ADMIN';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInvestor: boolean;
  isAdmin: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeUser(accessToken: string): AuthUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(accessToken);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        const decoded = decodeUser(stored);
        if (decoded) {
          setTokenState(stored);
          setUser(decoded);
        } else {
          await removeToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (accessToken: string) => {
    const decoded = decodeUser(accessToken);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    await setToken(accessToken);
    setTokenState(accessToken);
    setUser(decoded);
  };

  const logout = async () => {
    await removeToken();
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      isInvestor: user?.role === 'INVESTOR',
      isAdmin: user?.role === 'ADMIN',
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
