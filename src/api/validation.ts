/**
 * API Environment Validation
 * ตรวจสอบค่า environment variables ที่จำเป็นสำหรับ API
 */

import { env } from '../config/env';

export interface ApiValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * ตรวจสอบค่า environment variables ที่จำเป็นสำหรับ API
 */
export const validateApiEnvironment = (): ApiValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ตรวจสอบ API configuration
  if (!env.api.baseUrl) {
    errors.push('VITE_API_BASE_URL is required');
  } else {
    try {
      new URL(env.api.baseUrl);
    } catch {
      errors.push('VITE_API_BASE_URL must be a valid URL');
    }
  }

  if (env.api.timeout <= 0) {
    warnings.push('VITE_API_TIMEOUT should be greater than 0');
  }

  // ตรวจสอบ Authentication
  if (!env.auth.tokenKey) {
    errors.push('VITE_AUTH_TOKEN_KEY is required');
  }

  if (env.auth.tokenExpiry <= 0) {
    warnings.push('VITE_AUTH_TOKEN_EXPIRY should be greater than 0');
  }

  // ตรวจสอบ File Upload
  if (env.upload.maxFileSize <= 0) {
    warnings.push('VITE_MAX_FILE_SIZE should be greater than 0');
  }

  if (env.upload.allowedTypes.length === 0) {
    warnings.push('VITE_ALLOWED_FILE_TYPES should not be empty');
  }

  // ตรวจสอบ Production specific
  if (env.isProduction()) {
    if (!env.api.baseUrl.startsWith('https://')) {
      errors.push('API URL must use HTTPS in production');
    }

    if (env.dev.debug) {
      warnings.push('Debug mode should be disabled in production');
    }

    if (env.dev.tools) {
      warnings.push('Dev tools should be disabled in production');
    }

    if (env.dev.mockApi) {
      errors.push('Mock API should not be enabled in production');
    }
  }

  // ตรวจสอบ Company Information
  if (!env.company.name) {
    warnings.push('VITE_COMPANY_NAME is recommended');
  }

  if (!env.company.email) {
    warnings.push('VITE_COMPANY_EMAIL is recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * แสดงผลการตรวจสอบ environment
 */
export const logApiEnvironmentStatus = (): void => {
  const result = validateApiEnvironment();

  console.group('🔧 API Environment Validation');
  
  console.log(`Environment: ${env.app.environment}`);
  console.log(`API Base URL: ${env.api.baseUrl}`);
  console.log(`API Timeout: ${env.api.timeout}ms`);
  console.log(`Company: ${env.company.name}`);

  if (result.isValid) {
    console.log('✅ API Environment validation passed');
  } else {
    console.log('❌ API Environment validation failed');
  }

  if (result.errors.length > 0) {
    console.group('❌ Errors:');
    result.errors.forEach(error => console.error(`  • ${error}`));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
    console.groupEnd();
  }

  console.groupEnd();

  if (!result.isValid) {
    throw new Error(`API Environment validation failed. Errors: ${result.errors.join(', ')}`);
  }
};

/**
 * ตรวจสอบการเชื่อมต่อ API
 */
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${env.api.baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.warn(`⚠️ API returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

/**
 * เริ่มต้น API environment validation
 */
export const initializeApiEnvironment = async (): Promise<void> => {
  // ตรวจสอบ environment variables
  logApiEnvironmentStatus();

  // ตรวจสอบการเชื่อมต่อ API (ถ้าไม่ใช่ mock mode)
  if (!env.dev.mockApi) {
    const isConnected = await checkApiConnection();
    if (!isConnected && env.isProduction()) {
      throw new Error('API connection failed in production environment');
    } else if (!isConnected) {
      console.warn('⚠️ API connection failed, but continuing in development mode');
    }
  } else {
    console.log('🎭 Running in mock API mode');
  }

  console.log('🚀 API Environment initialized successfully');
};
