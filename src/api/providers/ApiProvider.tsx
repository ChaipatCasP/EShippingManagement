/**
 * API Context Provider สำหรับจัดการ global state และ configuration
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../apiClient';
import { AuthService } from '../services/authService';
import { env } from '../../config/env';
import type { User } from '../types';

interface ApiContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setBaseURL: (url: string) => void;
  refreshToken: () => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: React.ReactNode;
  baseURL?: string;
}

export function ApiProvider({ children, baseURL }: ApiProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตั้งค่า base URL ถ้ามีการระบุ (override env)
  useEffect(() => {
    if (baseURL) {
      console.log('Overriding API base URL to:', baseURL);
    } else {
      console.log('Using default API base URL from env:', env.api.baseUrl);
    }
  }, [baseURL]);

  // ตรวจสอบ authentication status เมื่อเริ่มต้น
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = apiClient.getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await AuthService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      } else {
        // Token หมดอายุหรือไม่ถูกต้อง
        apiClient.setAuthToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const setBaseURL = (url: string) => {
    console.log('API Base URL updated to:', url);
    // ใน API Client ใหม่จะใช้ env โดยอัตโนมัติ
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await AuthService.refreshToken();
      return response.success;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  const value: ApiContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
    setBaseURL,
    refreshToken
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext(): ApiContextType {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}

// HOC สำหรับตรวจสอบ authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useApiContext();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
