/**
 * Authentication API Services
 */

import { apiClient, type ApiResponse } from '../apiClient';
import type {
  LoginRequest,
  LoginResponse,
  User,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../types';

export class AuthService {
  /**
   * เข้าสู่ระบบ
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // บันทึก token ใน API client
    if (response.success && response.data.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * ออกจากระบบ
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>('/auth/logout');
      apiClient.setAuthToken(null);
      return response;
    } catch (error) {
      // ล้าง token แม้ logout ไม่สำเร็จ
      apiClient.setAuthToken(null);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบัน
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  }

  /**
   * รีเฟรช token
   */
  static async refreshToken(): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    const response = await apiClient.post<{ token: string; expiresIn: number }>('/auth/refresh');
    
    if (response.success && response.data.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  /**
   * เปลี่ยนรหัสผ่าน
   */
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', data);
  }

  /**
   * ลืมรหัสผ่าน
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', data);
  }

  /**
   * รีเซ็ตรหัสผ่าน
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', data);
  }

  /**
   * ตรวจสอบความถูกต้องของ token
   */
  static async verifyToken(): Promise<ApiResponse<{ valid: boolean; expiresAt: string }>> {
    return apiClient.get<{ valid: boolean; expiresAt: string }>('/auth/verify');
  }
}
