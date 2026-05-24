import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fd_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Auto-login on mount if token exists
  useEffect(() => {
    if (token) {
      authService.getMe()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('fd_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('fd_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('fd_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fd_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.getMe();
      setUser(u);
    } catch (e) {
      console.error('Error refreshing user:', e);
      logout();
    }
  }, [logout]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

