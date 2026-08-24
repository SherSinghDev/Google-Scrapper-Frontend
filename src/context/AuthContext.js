import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedToken = window.localStorage.getItem('leadmap_token');
          const storedUser = window.localStorage.getItem('leadmap_user');
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Verify with /me
            api.get('/auth/me')
              .then(res => {
                if (res.data?.user) {
                  setUser(res.data.user);
                  window.localStorage.setItem('leadmap_user', JSON.stringify(res.data.user));
                }
              })
              .catch(() => {
                // Keep stored session or let user re-login if expired
              });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success) {
        const { token: jwtToken, user: userData } = response.data;
        setToken(jwtToken);
        setUser(userData);

        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('leadmap_token', jwtToken);
          window.localStorage.setItem('leadmap_user', JSON.stringify(userData));
        }
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('leadmap_token');
      window.localStorage.removeItem('leadmap_user');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('leadmap_user', JSON.stringify(res.data.user));
        }
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshProfile,
        isSuperAdmin,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
