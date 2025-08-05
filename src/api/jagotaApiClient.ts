/**
 * JAGOTA API Client สำหรับ E-Shipping Management System
 * ใช้สำหรับการเรียก API ของ JAGOTA โดยเฉพาะ
 */

import { env } from '../config/env';

export interface JagotaApiResponse<T = any> {
  error: boolean;
  message: string;
  data: T;
  rowsAffected: number;
  query: string;
}

export interface JagotaApiError {
  message: string;
  status: number;
  error: boolean;
}

class JagotaApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = env.jagotaApi.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // โหลด token จาก localStorage ถ้ามี
    this.authToken = localStorage.getItem(env.auth.tokenKey);
  }

  /**
   * ตั้งค่า Authentication Token
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem(env.auth.tokenKey, token);
    } else {
      localStorage.removeItem(env.auth.tokenKey);
    }
  }

  /**
   * สร้าง headers สำหรับ request
   */
  private createHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * สร้าง URL พร้อม query parameters
   */
  private createUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * จัดการ response และ error
   */
  private async handleResponse<T>(response: Response): Promise<JagotaApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: JagotaApiError = {
        message: data.message || `HTTP ${response.status}`,
        status: response.status,
        error: true
      };
      throw error;
    }

    return data;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: { params?: Record<string, any>; headers?: Record<string, string> }): Promise<JagotaApiResponse<T>> {
    const url = this.createUrl(endpoint, config?.params);
    const headers = this.createHeaders(config?.headers);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: { params?: Record<string, any>; headers?: Record<string, string> }): Promise<JagotaApiResponse<T>> {
    const url = this.createUrl(endpoint, config?.params);
    const headers = this.createHeaders(config?.headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: { params?: Record<string, any>; headers?: Record<string, string> }): Promise<JagotaApiResponse<T>> {
    const url = this.createUrl(endpoint, config?.params);
    const headers = this.createHeaders(config?.headers);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: { params?: Record<string, any>; headers?: Record<string, string> }): Promise<JagotaApiResponse<T>> {
    const url = this.createUrl(endpoint, config?.params);
    const headers = this.createHeaders(config?.headers);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: { params?: Record<string, any>; headers?: Record<string, string> }): Promise<JagotaApiResponse<T>> {
    const url = this.createUrl(endpoint, config?.params);
    const headers = this.createHeaders(config?.headers);

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }
}

// สร้าง instance เดียวสำหรับใช้ทั่วแอป
export const jagotaApiClient = new JagotaApiClient();

// Export class สำหรับใช้สร้าง instance ใหม่ถ้าจำเป็น
export { JagotaApiClient };
