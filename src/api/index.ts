/**
 * API Module Index - Export ทุกอย่างที่จำเป็นสำหรับการใช้งาน API
 */

// Environment & Configuration
export { env } from '../config/env';

// API Client
export { apiClient, type ApiResponse, type ApiError, type RequestConfig } from './apiClient';

// Types
export * from './types';

// Services
export { AuthService } from './services/authService';
export { ShipmentService } from './services/shipmentService';
export { DashboardService } from './services/dashboardService';

// Hooks
export * from './hooks/useApi';

// Providers
export { ApiProvider, useApiContext, withAuth } from './providers/ApiProvider';

// Validation
export { 
  validateApiEnvironment, 
  logApiEnvironmentStatus, 
  checkApiConnection, 
  initializeApiEnvironment,
  type ApiValidationResult 
} from './validation';

// Utility functions
export const isApiError = (error: any): error is import('./apiClient').ApiError => {
  return error && typeof error.message === 'string' && typeof error.status === 'number';
};

export const handleApiError = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
