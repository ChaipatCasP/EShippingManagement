/**
 * API Client สำหรับ E-Shipping Management System
 * รองรับการจัดการ authentication, request/response interceptors, และ error handling
 */

import { env } from '../config/env';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || env.api.baseUrl;
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
   * ดึง Authentication Token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * สร้าง headers สำหรับ request
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * สร้าง URL พร้อม query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
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
   * จัดการ Response และ Error
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new Error('Invalid response format');
    }

    if (!response.ok) {
      const apiError: ApiError = {
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        errors: data.errors
      };
      throw apiError;
    }

    return data;
  }

  /**
   * GET Request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers);
    const timeout = config?.timeout || env.api.timeout;

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST Request
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers);
    const timeout = config?.timeout || env.api.timeout;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT Request
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers);
    const timeout = config?.timeout || env.api.timeout;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH Request
   */
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers);
    const timeout = config?.timeout || env.api.timeout;

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE Request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers);
    const timeout = config?.timeout || env.api.timeout;

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload File
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const headers = this.buildHeaders();
    
    // ตรวจสอบขนาดไฟล์
    if (file.size > env.upload.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size ${env.upload.maxFileSize}`);
    }

    // ตรวจสอบประเภทไฟล์
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !env.upload.allowedTypes.includes(fileExtension)) {
      throw new Error(`File type ${fileExtension} is not allowed. Allowed types: ${env.upload.allowedTypes.join(', ')}`);
    }
    
    // ลบ Content-Type ให้ browser ตั้งค่าเอง (สำหรับ multipart/form-data)
    delete headers['Content-Type'];

    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, String(additionalData[key]));
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(env.api.timeout),
    });

    return this.handleResponse<T>(response);
  }
}

// สร้าง instance เดียวที่ใช้ทั่วทั้งแอป
export const apiClient = new ApiClient();

// Export class สำหรับสร้าง instance เพิ่มเติมถ้าจำเป็น
export default ApiClient;
