import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminLogin, clearToken, getToken } from '../api/client';
import type { AdminUser } from '../api/types';

type AuthState = {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore admin identity from token if it exists.
    const token = getToken();
    if (!token) { setLoading(false); return; }
    // We don't decode the token; the API will 401 on invalid tokens.
    // Store a placeholder so ProtectedRoute lets us through; a real
    // /admin/me endpoint would be better and is a Batch 8 improvement.
    setAdmin({
      id: '', email: '', role: 'super_admin',
      isActive: true, lastLoginAt: null, createdAt: '',
    });
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await adminLogin(email, password);
    localStorage.setItem('propeller_admin_token', data.accessToken);
    setAdmin(data.admin);
  };

  const logout = () => {
    clearToken();
    setAdmin(null);
  };

  return (
    <AuthCtx.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
};