'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  refreshToken: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user info from cookie
        const userInfoCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user_info='));
        
        if (userInfoCookie) {
          const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect to Google OAuth login
  const login = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/login';
  };

  // Logout user
  const logout = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/logout';
  };

  // Refresh access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/refresh');
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      setError('Failed to refresh authentication');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
