'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  postKarma: number;
  commentKarma: number;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    const res = await authApi.me();
    setUser(res.data);
    return res.data as User;
  };

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login({ usernameOrEmail, password });
      const { accessToken, refreshToken, user: userData } = res.data;
      Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'Lax' });
      Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'Lax' });
      const resolvedUser = userData || await loadCurrentUser();
      setUser(resolvedUser);
      toast.success(`Welcome back, ${resolvedUser?.username || usernameOrEmail}! 👋`);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.register({ username, email, password });
      const { accessToken, refreshToken, user: userData } = res.data;
      Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'Lax' });
      Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'Lax' });
      const resolvedUser = userData || await loadCurrentUser();
      setUser(resolvedUser);
      toast.success('Account created! Welcome to ThreadVerse 🚀');
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    toast.success('Logged out successfully');
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
