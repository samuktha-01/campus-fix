import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// API client and error extraction utilities
import { apiClient, extractErrorMessage } from '../lib/api';
import { UserProfile, TokenResponse, AuthContextType } from '../types/auth';
import { UserRole } from '../lib/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize and verify authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch current user from server-verified /auth/me endpoint
        const response = await apiClient.get<UserProfile>('/auth/me');
        setUser(response.data);
        setToken(storedToken);
      } catch {
        // If access token is invalid or expired, attempt to refresh
        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (storedRefreshToken) {
          try {
            const refreshRes = await apiClient.post<TokenResponse>('/auth/refresh', {
              refresh_token: storedRefreshToken,
            });
            localStorage.setItem('access_token', refreshRes.data.access_token);
            localStorage.setItem('refresh_token', refreshRes.data.refresh_token);
            setToken(refreshRes.data.access_token);
            setUser(refreshRes.data.user);
          } catch {
            // Refresh failed: clear local storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setToken(null);
          }
        } else {
          localStorage.removeItem('access_token');
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<TokenResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      const { access_token, refresh_token, user: loggedInUser } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setToken(access_token);
      setUser(loggedInUser);

      return loggedInUser;
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Authentication failed. Please check your credentials.');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (name: string, email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<TokenResponse>('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'STUDENT',
      });

      const { access_token, refresh_token, user: registeredUser } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setToken(access_token);
      setUser(registeredUser);

      return registeredUser;
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Registration failed. Please check your inputs.');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Notify backend to blacklist token
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  // Check role authorization
  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        hasRole,
        clearError,
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
