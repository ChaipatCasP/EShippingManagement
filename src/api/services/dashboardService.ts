/**
 * Dashboard & Analytics API Services
 */

import { apiClient, type ApiResponse } from '../apiClient';
import { env } from '../../config/env';
import type {
  DashboardStats,
  EShippingDashboardResponse,
  EShippingPOListResponse,
  ShipmentAnalytics,
  Notification,
  NotificationSettings
} from '../types';

export class DashboardService {
  /**
   * ดึงข้อมูล E-Shipping Dashboard จาก JAGOTA API
   */
  static async getEShippingDashboard(): Promise<EShippingDashboardResponse> {
    try {
      const apiUrl = `${env.jagotaApi.baseUrl}/v1/es/eshipping/dashboard`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiSkIiLCJ1c2VybmFtZSI6Imt1c3VtYUBzYW5ndGhvbmdzdWtzaGlwcGluZ3NvbHV0aW9uLmNvLnRoIiwic3VwcGxpZXJDb2RlIjoiNjIzMiIsImlhdCI6MTc1NDI4MDIxMywiZXhwIjoxNzg1ODE2MjEzfQ.1bys3p_-9kQ-DlgWfz7g3m2ap3_0jypyQDF8FUuQIR0`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EShippingDashboardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching E-Shipping dashboard:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล PO List จาก JAGOTA API
   */
  static async getEShippingPOList(
    fromDate: string = '01-Jan-2021',
    toDate: string = '01-Jan-2026',
    transportBy: string = '',
    keyword: string = ''
  ): Promise<EShippingPOListResponse> {
    try {
      // Log parameters for debugging
      console.log('PO List API Parameters:', { fromDate, toDate, transportBy, keyword });
      
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (transportBy) params.append('transportBy', transportBy);
      if (keyword) params.append('keyword', keyword);
      
      const apiUrl = `${env.jagotaApi.baseUrl}/v1/es/eshipping/po-list?${params.toString()}`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiSkIiLCJ1c2VybmFtZSI6Imt1c3VtYUBzYW5ndGhvbmdzdWtzaGlwcGluZ3NvbHV0aW9uLmNvLnRoIiwic3VwcGxpZXJDb2RlIjoiNjIzMiIsImlhdCI6MTc1NDI4MDIxMywiZXhwIjoxNzg1ODE2MjEzfQ.1bys3p_-9kQ-DlgWfz7g3m2ap3_0jypyQDF8FUuQIR0`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EShippingPOListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching E-Shipping PO list:', error);
      throw error;
    }
  }

  /**
   * ดึงสถิติหลักของ Dashboard (เดิม - สำหรับ fallback)
   */
  static async getDashboardStats(period?: string): Promise<ApiResponse<DashboardStats>> {
    const params = period ? { period } : {};
    return apiClient.get<DashboardStats>('/dashboard/stats', { params });
  }

  /**
   * ดึงข้อมูลวิเคราะห์การจัดส่ง
   */
  static async getShipmentAnalytics(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<ShipmentAnalytics>> {
    const params: any = { period };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    
    return apiClient.get<ShipmentAnalytics>('/dashboard/analytics', { params });
  }

  /**
   * ดึงข้อมูลรายได้ตามช่วงเวลา
   */
  static async getRevenueStats(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<{ period: string; revenue: number; growth: number }[]>> {
    const params: any = { period };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    
    return apiClient.get<{ period: string; revenue: number; growth: number }[]>('/dashboard/revenue', { params });
  }

  /**
   * ดึงข้อมูลประสิทธิภาพการส่ง
   */
  static async getDeliveryPerformance(): Promise<ApiResponse<{
    onTimeDelivery: number;
    averageDeliveryTime: number;
    customerSatisfaction: number;
    failureRate: number;
  }>> {
    return apiClient.get('/dashboard/performance');
  }

  /**
   * ดึงการแจ้งเตือนทั้งหมด
   */
  static async getNotifications(limit?: number): Promise<ApiResponse<Notification[]>> {
    const params = limit ? { limit } : {};
    return apiClient.get<Notification[]>('/notifications', { params });
  }

  /**
   * ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  static async getUnreadNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>('/notifications/unread');
  }

  /**
   * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
   */
  static async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/notifications/${id}/read`);
  }

  /**
   * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
   */
  static async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/notifications/mark-all-read');
  }

  /**
   * ลบการแจ้งเตือน
   */
  static async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/notifications/${id}`);
  }

  /**
   * ดึงการตั้งค่าการแจ้งเตือน
   */
  static async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.get<NotificationSettings>('/settings/notifications');
  }

  /**
   * อัปเดตการตั้งค่าการแจ้งเตือน
   */
  static async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.put<NotificationSettings>('/settings/notifications', settings);
  }

  /**
   * ดึงข้อมูลกิจกรรมล่าสุด
   */
  static async getRecentActivities(limit?: number): Promise<ApiResponse<{
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
    data?: any;
  }[]>> {
    const params = limit ? { limit } : {};
    return apiClient.get('/dashboard/activities', { params });
  }

  /**
   * ดึงข้อมูลการใช้งานระบบ
   */
  static async getSystemUsage(): Promise<ApiResponse<{
    activeUsers: number;
    totalShipmentsToday: number;
    pendingTasks: number;
    systemHealth: 'good' | 'warning' | 'critical';
  }>> {
    return apiClient.get('/dashboard/system-usage');
  }
}
