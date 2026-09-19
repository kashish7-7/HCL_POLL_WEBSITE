import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('pollnow_token') || localStorage.getItem('pulsevote_token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn("Session expired:", err);
          localStorage.removeItem('pollnow_token');
          localStorage.removeItem('pulsevote_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    localStorage.setItem('pollnow_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('pollnow_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('pollnow_token');
    localStorage.removeItem('pulsevote_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
