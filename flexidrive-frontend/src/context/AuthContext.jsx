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
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('fd_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password);
    localStorage.setItem('fd_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fd_token');
    localStorage.removeItem('fd_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.getMe();
      setUser(u);
    } catch {
      // API error, might be down, ignore.
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    try {
      // The old frontend didn't await this perfectly, but it's okay for now
      // Actually we will just update locally after calling updateProfile
      setUser(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error(err);
    }
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

