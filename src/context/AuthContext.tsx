import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLoginApi, getAdminToken, adminLogout, isAdminLoggedIn } from '../services/complaintService';

interface User {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setUser({
        username: 'admin',
        name: 'Municipal Officer',
        role: 'Zonal Administrator',
      });
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await adminLoginApi({ username, password });
      if (res.success && res.token) {
        setUser({
          username: username,
          name: 'Municipal Officer',
          role: 'Zonal Administrator',
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    adminLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};