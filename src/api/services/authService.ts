/**
 * Authentication API Services for JAGOTA
 */

import { env } from '../../config/env';
import type {
  LoginRequest,
  JagotaLoginResponse,
  OTPValidationRequest,
  JagotaOTPValidationResponse
} from '../types';

export class AuthService {
  /**
   * เข้าสู่ระบบด้วย JAGOTA API
   */
  static async login(credentials: LoginRequest): Promise<JagotaLoginResponse> {
    try {
      const apiUrl = `${env.jagotaApi.baseUrl}/auth/web-user-login`;
      
      console.log('Login attempt:', {
        url: apiUrl,
        username: credentials.username
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          moduleName: 'SHIPPING'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JagotaLoginResponse = await response.json();
      console.log('Login response:', data);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * ยืนยัน OTP ด้วย JAGOTA API
   */
  static async validateOTP(request: OTPValidationRequest): Promise<JagotaOTPValidationResponse> {
    try {
      const apiUrl = `${env.jagotaApi.baseUrl}/auth/web-user-otp-validate`;
      
      console.log('Validating OTP:', {
        url: apiUrl,
        payload: {
          username: request.username,
          moduleName: request.moduleName,
          token: request.token.substring(0, 10) + '...', // แสดงเฉพาะส่วนต้น token เพื่อความปลอดภัย
          otp: '***' // ซ่อน OTP เพื่อความปลอดภัย
        }
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: request.username,
          moduleName: request.moduleName,
          token: request.token,
          otp: request.otp
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OTP validation HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JagotaOTPValidationResponse = await response.json();
      console.log('OTP validation response:', data);

      return data;
    } catch (error) {
      console.error('OTP validation error:', error);
      throw error;
    }
  }

  /**
   * บันทึก access token
   */
  static setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * ตรวจสอบสถานะการ login
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * ดึง token ปัจจุบัน
   */
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * ออกจากระบบ
   */
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('jagota_remember_credentials');
  }
}