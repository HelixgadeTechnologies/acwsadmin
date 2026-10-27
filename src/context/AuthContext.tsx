'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '@/types';
import { ApiService } from '@/lib/api';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('acws_admin_token');
        const storedUser = localStorage.getItem('acws_admin_user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // Ignore parse error
            }
          }

          // Hydrate & verify live session with backend
          try {
            const liveUser = await ApiService.getMe();
            setUser(liveUser);
            localStorage.setItem('acws_admin_user', JSON.stringify(liveUser));
          } catch (err: any) {
            if (err?.message === 'Unauthorized') {
              logout();
            }
          }
        }
      } catch (e) {
        console.error('Failed to load stored auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await ApiService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('acws_admin_token', data.token);
      localStorage.setItem('acws_admin_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('acws_admin_token');
      localStorage.removeItem('acws_admin_user');
      sessionStorage.removeItem('acws_admin_token');
      sessionStorage.removeItem('acws_admin_user');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
