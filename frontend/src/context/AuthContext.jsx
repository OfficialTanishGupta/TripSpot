import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('ts_token'));
  const [email, setEmailState] = useState(() => localStorage.getItem('ts_email'));

  const login = useCallback((newToken, userEmail) => {
    localStorage.setItem('ts_token', newToken);
    if (userEmail) localStorage.setItem('ts_email', userEmail);
    setTokenState(newToken);
    setEmailState(userEmail);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_email');
    setTokenState(null);
    setEmailState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, email, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
