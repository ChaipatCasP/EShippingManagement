/**
 * Authentication utility for managing auth tokens
 */

export class AuthUtils {
  /**
   * Get auth token from localStorage with fallback
   * @returns Bearer token string
   */
  static getAuthToken(): string {
    // ดึง auth_token จาก localStorage
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      return `Bearer ${authToken}`;
    }
    
    // Fallback ในกรณีที่ไม่มี auth_token ใน localStorage
    console.warn("⚠️ No auth_token found in localStorage, using fallback token");
    return `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiSkIiLCJ1c2VybmFtZSI6Imt1c3VtYUBzYW5ndGhvbmdzdWtzaGlwcGluZ3NvbHV0aW9uLmNvLnRoIiwic3VwcGxpZXJDb2RlIjoiNjIzMiIsImlhdCI6MTc1NDI4MDIxMywiZXhwIjoxNzg1ODE2MjEzfQ.1bys3p_-9kQ-DlgWfz7g3m2ap3_0jypyQDF8FUuQIR0`;
  }

  /**
   * Set auth token to localStorage
   * @param token - The auth token to store
   */
  static setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Remove auth token from localStorage
   */
  static removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Check if user is authenticated
   * @returns true if auth token exists
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}
