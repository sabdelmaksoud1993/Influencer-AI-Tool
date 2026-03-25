import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = await api.getToken();
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      // Try to get fresh user data
      const data = await api.get<{ user: User }>('/api/mobile/me');
      await api.saveUser(data.user as unknown as Record<string, unknown>);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    } catch {
      // Token expired or invalid — try cached user
      const cached = await api.getSavedUser();
      if (cached) {
        setState({ user: cached as unknown as User, isLoading: false, isAuthenticated: true });
      } else {
        await api.clearToken();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (code: string) => {
    const data = await api.post<{ token: string; user: User }>(
      '/api/mobile/login',
      { code }
    );
    await api.setToken(data.token);
    await api.saveUser(data.user as unknown as Record<string, unknown>);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await api.clearToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
