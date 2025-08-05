/**
 * Shipment API Services
 */

import { apiClient, type ApiResponse } from '../apiClient';
import { env } from '../../config/env';
import type {
  ShipmentRequest,
  ShipmentResponse,
  ShipmentFilters,
  PaginationParams,
  PaginatedResponse,
  TrackingResponse,
  ShipmentStatus,
  TransportTypeResponse
} from '../types';

export class ShipmentService {
  /**
   * สร้างการจัดส่งใหม่
   */
  static async createShipment(data: ShipmentRequest): Promise<ApiResponse<ShipmentResponse>> {
    return apiClient.post<ShipmentResponse>('/shipments', data);
  }

  /**
   * ดึงรายการการจัดส่งทั้งหมด (แบบมี pagination)
   */
  static async getShipments(
    filters?: ShipmentFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<ShipmentResponse>>> {
    const params = {
      ...filters,
      ...pagination
    };
    
    return apiClient.get<PaginatedResponse<ShipmentResponse>>('/shipments', { params });
  }

  /**
   * ดึงข้อมูลการจัดส่งตาม ID
   */
  static async getShipmentById(id: string): Promise<ApiResponse<ShipmentResponse>> {
    return apiClient.get<ShipmentResponse>(`/shipments/${id}`);
  }

  /**
   * อัปเดตข้อมูลการจัดส่ง
   */
  static async updateShipment(id: string, data: Partial<ShipmentRequest>): Promise<ApiResponse<ShipmentResponse>> {
    return apiClient.put<ShipmentResponse>(`/shipments/${id}`, data);
  }

  /**
   * อัปเดตสถานะการจัดส่ง
   */
  static async updateShipmentStatus(
    id: string, 
    status: ShipmentStatus, 
    note?: string,
    location?: string
  ): Promise<ApiResponse<ShipmentResponse>> {
    return apiClient.patch<ShipmentResponse>(`/shipments/${id}/status`, {
      status,
      note,
      location
    });
  }

  /**
   * ลบการจัดส่ง
   */
  static async deleteShipment(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/shipments/${id}`);
  }

  /**
   * ติดตามการจัดส่งด้วย tracking number
   */
  static async trackShipment(trackingNumber: string): Promise<ApiResponse<TrackingResponse>> {
    return apiClient.get<TrackingResponse>(`/shipments/track/${trackingNumber}`);
  }

  /**
   * ค้นหาการจัดส่ง
   */
  static async searchShipments(query: string): Promise<ApiResponse<ShipmentResponse[]>> {
    return apiClient.get<ShipmentResponse[]>('/shipments/search', {
      params: { q: query }
    });
  }

  /**
   * ดึงข้อมูล timeline ของการจัดส่ง
   */
  static async getShipmentTimeline(id: string): Promise<ApiResponse<TrackingResponse>> {
    return apiClient.get<TrackingResponse>(`/shipments/${id}/timeline`);
  }

  /**
   * สร้าง shipping label (PDF)
   */
  static async generateShippingLabel(id: string): Promise<ApiResponse<{ url: string }>> {
    return apiClient.get<{ url: string }>(`/shipments/${id}/label`);
  }

  /**
   * ยกเลิกการจัดส่ง
   */
  static async cancelShipment(id: string, reason?: string): Promise<ApiResponse<ShipmentResponse>> {
    return apiClient.patch<ShipmentResponse>(`/shipments/${id}/cancel`, { reason });
  }

  /**
   * คำนวณค่าจัดส่ง
   */
  static async calculateShippingCost(data: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    serviceType: string;
    destination: string;
    origin?: string;
  }): Promise<ApiResponse<{ cost: number; estimatedDays: number }>> {
    return apiClient.post<{ cost: number; estimatedDays: number }>('/shipments/calculate-cost', data);
  }

  /**
   * ดึงรายการการจัดส่งที่รอดำเนินการ
   */
  static async getPendingShipments(): Promise<ApiResponse<ShipmentResponse[]>> {
    return apiClient.get<ShipmentResponse[]>('/shipments/pending');
  }

  /**
   * ดึงรายการการจัดส่งที่กำลังส่ง
   */
  static async getInTransitShipments(): Promise<ApiResponse<ShipmentResponse[]>> {
    return apiClient.get<ShipmentResponse[]>('/shipments/in-transit');
  }

  /**
   * ดึงรายการการจัดส่งที่ส่งสำเร็จแล้ว
   */
  static async getDeliveredShipments(dateFrom?: string, dateTo?: string): Promise<ApiResponse<ShipmentResponse[]>> {
    const params: any = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    
    return apiClient.get<ShipmentResponse[]>('/shipments/delivered', { params });
  }

  /**
   * Export ข้อมูลการจัดส่ง (CSV/Excel)
   */
  static async exportShipments(
    format: 'csv' | 'excel',
    filters?: ShipmentFilters
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    return apiClient.post<{ url: string; filename: string }>('/shipments/export', {
      format,
      filters
    });
  }

  /**
   * ดึงรายการ Transport Type จาก JAGOTA API
   */
  static async getTransportTypes(): Promise<TransportTypeResponse> {
    try {
      const apiUrl = `${env.jagotaApi.baseUrl}/v1/es/eshipping/transport-type`;
      
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

      const data: TransportTypeResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching transport types:', error);
      throw error;
    }
  }
}
