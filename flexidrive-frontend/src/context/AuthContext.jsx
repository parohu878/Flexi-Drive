import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { DEMO_USER } from '../services/demoData';

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
          // If API is unreachable but we have a demo token, use demo user
          const storedUser = localStorage.getItem('fd_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem('fd_token');
              localStorage.removeItem('fd_user');
              setToken(null);
            }
          } else {
            localStorage.removeItem('fd_token');
            setToken(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('fd_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Fallback: demo login when backend is not available
      if (email === 'joan@example.com' && password === 'password123') {
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('fd_token', demoToken);
        localStorage.setItem('fd_user', JSON.stringify(DEMO_USER));
        setToken(demoToken);
        setUser(DEMO_USER);
        return DEMO_USER;
      }
      // If it's a network error (backend down), try demo login for any credentials
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        const demoUser = {
          ...DEMO_USER,
          email,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          avatar: email.substring(0, 2).toUpperCase(),
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('fd_token', demoToken);
        localStorage.setItem('fd_user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
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
      // Fallback: demo register when backend is not available
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        const demoUser = {
          ...DEMO_USER,
          id: 'user-' + Date.now(),
          name,
          email,
          avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2),
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('fd_token', demoToken);
        localStorage.setItem('fd_user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
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
      // Keep current user if API fails
      const storedUser = localStorage.getItem('fd_user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { logout(); }
      }
    }
  }, [logout]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('fd_user', JSON.stringify(updated));
      return updated;
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
