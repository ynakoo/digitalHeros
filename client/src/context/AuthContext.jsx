import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
    setUser(data.user);
    return data;
  };

  const signup = async (userData) => {
    const { data } = await api.post('/api/auth/signup', userData);
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await api.put('/api/auth/profile', updates);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      refreshUser: fetchUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSubscriber: user?.subscription_status === 'active'
    }}>
      {children}
    </AuthContext.Provider>
  );
}
