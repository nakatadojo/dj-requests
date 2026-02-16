import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [dj, setDj] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and DJ info
    const token = localStorage.getItem('dj_token');
    const djData = localStorage.getItem('dj_data');

    if (token && djData) {
      try {
        setDj(JSON.parse(djData));
      } catch (error) {
        console.error('Failed to parse DJ data:', error);
        localStorage.removeItem('dj_token');
        localStorage.removeItem('dj_data');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      localStorage.setItem('dj_token', response.token);
      localStorage.setItem('dj_data', JSON.stringify(response.dj));

      setDj(response.dj);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('dj_token');
    localStorage.removeItem('dj_data');
    setDj(null);
  };

  return (
    <AuthContext.Provider value={{ dj, loading, login, logout, isAuthenticated: !!dj }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
