/**
 * React Hooks สำหรับการใช้งาน API
 */

import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/authService';
import { ShipmentService } from '../services/shipmentService';
import { DashboardService } from '../services/dashboardService';
import type { 
  User, 
  LoginRequest, 
  ShipmentResponse, 
  ShipmentFilters,
  PaginationParams,
  DashboardStats,
  Notification
} from '../types';
import type { ApiError } from '../apiClient';

// === Authentication Hooks ===

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ตรวจสอบ authentication status เมื่อ component mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      // สำหรับ JAGOTA ตรวจสอบจาก localStorage 
      const savedUser = localStorage.getItem('user_data');
      if (savedUser && AuthService.getToken()) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.login(credentials);
      if (response.data.status === 'success') {
        // สำหรับ JAGOTA login จะได้เฉพาะ token ต้องรอ OTP validation
        return { success: true, data: response.data };
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus
  };
}

// === Shipment Hooks ===

export function useShipments(filters?: ShipmentFilters, pagination?: PaginationParams) {
  const [data, setData] = useState<ShipmentResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ShipmentService.getShipments(filters, pagination);
      if (response.success) {
        setData(response.data.data);
        setTotalCount(response.data.pagination.total);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const refetch = () => {
    fetchShipments();
  };

  return {
    data,
    totalCount,
    isLoading,
    error,
    refetch
  };
}

export function useShipment(id: string) {
  const [data, setData] = useState<ShipmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShipment = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await ShipmentService.getShipmentById(id);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  const refetch = () => {
    fetchShipment();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
}

export function useCreateShipment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShipment = async (shipmentData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ShipmentService.createShipment(shipmentData);
      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createShipment,
    isLoading,
    error
  };
}

// === Dashboard Hooks ===

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DashboardService.getDashboardStats();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = () => {
    fetchStats();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
}

export function useNotifications() {
  const [data, setData] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allResponse, unreadResponse] = await Promise.all([
        DashboardService.getNotifications(50),
        DashboardService.getUnreadNotifications()
      ]);
      
      if (allResponse.success) {
        setData(allResponse.data);
      }
      if (unreadResponse.success) {
        setUnreadCount(unreadResponse.data.length);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await DashboardService.markNotificationAsRead(id);
      setData(prev => prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await DashboardService.markAllNotificationsAsRead();
      setData(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const refetch = () => {
    fetchNotifications();
  };

  return {
    data,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch
  };
}

// === Generic API Hook ===

export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = () => {
    execute();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    execute
  };
}
