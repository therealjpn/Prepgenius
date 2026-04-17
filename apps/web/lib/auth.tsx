'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
  id: number; email: string; fullName: string;
  avatarUrl?: string; isPaid: boolean; createdAt: string;
}

interface AuthCtx {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pg_token');
    if (token) {
      api.getMe().then(d => setUser(d.user)).catch(() => localStorage.removeItem('pg_token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('pg_token', data.token);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const data = await api.signup(email, password, fullName);
    localStorage.setItem('pg_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('pg_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
