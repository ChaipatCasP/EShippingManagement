/**
 * Environment Configuration
 * ไฟล์สำหรับจัดการค่า environment variables ที่ใช้ในแอป
 */

// ฟังก์ชันสำหรับดึงค่าที่เป็น optional
const getOptionalEnv = (key: keyof ImportMetaEnv, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

// ฟังก์ชันสำหรับแปลงเป็น boolean
const getBooleanEnv = (key: keyof ImportMetaEnv, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
};

// ฟังก์ชันสำหรับแปลงเป็น number
const getNumberEnv = (key: keyof ImportMetaEnv, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    author: string;
    environment: string;
  };
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
  };
  jagotaApi: {
    baseUrl: string;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
    sessionTimeout: number;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    staticUrl: string;
  };
  google: {
    mapsApiKey: string;
    analyticsId: string;
  };
  stripe: {
    publishableKey: string;
  };
  dev: {
    tools: boolean;
    debug: boolean;
    mockApi: boolean;
  };
  features: {
    notifications: boolean;
    analytics: boolean;
    export: boolean;
    bulkOperations: boolean;
    advancedFilters: boolean;
  };
  i18n: {
    defaultLanguage: string;
    supportedLanguages: string[];
    defaultTimezone: string;
    defaultCurrency: string;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  isProduction: () => boolean;
  isDevelopment: () => boolean;
  isFeatureEnabled: (feature: keyof AppConfig['features']) => boolean;
}

export const env: AppConfig = {
  // App Configuration
  app: {
    name: getOptionalEnv('VITE_APP_NAME', 'E-Shipping Management'),
    version: getOptionalEnv('VITE_APP_VERSION', '1.0.0'),
    description: getOptionalEnv('VITE_APP_DESCRIPTION', 'Premium Food Ingredients Trading & Logistics'),
    author: getOptionalEnv('VITE_APP_AUTHOR', 'JAGOTA'),
    environment: getOptionalEnv('VITE_APP_ENV', 'development'),
  },

  // API Configuration
  api: {
    baseUrl: getOptionalEnv('VITE_API_BASE_URL', 'http://localhost:3001/api'),
    version: getOptionalEnv('VITE_API_VERSION', 'v1'),
    timeout: getNumberEnv('VITE_API_TIMEOUT', 30000),
  },

  // JAGOTA API Configuration
  jagotaApi: {
    baseUrl: getOptionalEnv('VITE_JAGOTA_API_BASE_URL', 'https://jnodeapi-staging.jagota.com'),
  },

  // Authentication
  auth: {
    tokenKey: getOptionalEnv('VITE_AUTH_TOKEN_KEY', 'eshipping_auth_token'),
    refreshTokenKey: getOptionalEnv('VITE_AUTH_REFRESH_TOKEN_KEY', 'eshipping_refresh_token'),
    tokenExpiry: getNumberEnv('VITE_AUTH_TOKEN_EXPIRY', 3600),
    sessionTimeout: getNumberEnv('VITE_SESSION_TIMEOUT', 1800),
  },

  // File Upload
  upload: {
    maxFileSize: getNumberEnv('VITE_MAX_FILE_SIZE', 10485760), // 10MB
    allowedTypes: getOptionalEnv('VITE_ALLOWED_FILE_TYPES', 'pdf,jpg,jpeg,png,gif,doc,docx,xls,xlsx').split(','),
    staticUrl: getOptionalEnv('STATIC_FILES_URL', 'http://localhost:3001/static'),
  },

  // Google Services
  google: {
    mapsApiKey: getOptionalEnv('GOOGLE_MAPS_API_KEY'),
    analyticsId: getOptionalEnv('GOOGLE_ANALYTICS_ID'),
  },

  // Payment
  stripe: {
    publishableKey: getOptionalEnv('STRIPE_PUBLISHABLE_KEY'),
  },

  // Development
  dev: {
    tools: getBooleanEnv('VITE_DEV_TOOLS', true),
    debug: getBooleanEnv('VITE_DEBUG_MODE', true),
    mockApi: getBooleanEnv('VITE_MOCK_API', false),
  },

  // Feature Flags
  features: {
    notifications: getBooleanEnv('VITE_FEATURE_NOTIFICATIONS', true),
    analytics: getBooleanEnv('VITE_FEATURE_ANALYTICS', true),
    export: getBooleanEnv('VITE_FEATURE_EXPORT', true),
    bulkOperations: getBooleanEnv('VITE_FEATURE_BULK_OPERATIONS', true),
    advancedFilters: getBooleanEnv('VITE_FEATURE_ADVANCED_FILTERS', true),
  },

  // Localization
  i18n: {
    defaultLanguage: getOptionalEnv('VITE_DEFAULT_LANGUAGE', 'th'),
    supportedLanguages: getOptionalEnv('VITE_SUPPORTED_LANGUAGES', 'th,en').split(','),
    defaultTimezone: getOptionalEnv('VITE_DEFAULT_TIMEZONE', 'Asia/Bangkok'),
    defaultCurrency: getOptionalEnv('VITE_DEFAULT_CURRENCY', 'THB'),
  },

  // Company Information
  company: {
    name: getOptionalEnv('VITE_COMPANY_NAME', 'JAGOTA Trading Co., Ltd.'),
    address: getOptionalEnv('VITE_COMPANY_ADDRESS', '123 Business District, Bangkok 10110, Thailand'),
    phone: getOptionalEnv('VITE_COMPANY_PHONE', '+66-2-xxx-xxxx'),
    email: getOptionalEnv('VITE_COMPANY_EMAIL', 'info@jagota.com'),
    website: getOptionalEnv('VITE_COMPANY_WEBSITE', 'https://jagota.com'),
  },

  // Social Media
  social: {
    facebook: getOptionalEnv('VITE_FACEBOOK_URL'),
    twitter: getOptionalEnv('VITE_TWITTER_URL'),
    linkedin: getOptionalEnv('VITE_LINKEDIN_URL'),
  },

  // Validation helpers
  isProduction: () => env.app.environment === 'production',
  isDevelopment: () => env.app.environment === 'development',
  isFeatureEnabled: (feature: keyof typeof env.features) => env.features[feature],
};

// Validate required environment variables on app start
export const validateEnv = () => {
  const errors: string[] = [];

  // ตรวจสอบค่าที่จำเป็นในแต่ละ environment
  if (env.isProduction()) {
    // Production required vars
    if (!env.api.baseUrl.includes('https://')) {
      errors.push('VITE_API_BASE_URL must use HTTPS in production');
    }
    
    if (env.dev.debug) {
      errors.push('VITE_DEBUG_MODE should be false in production');
    }
  }

  if (errors.length > 0) {
    console.error('Environment validation errors:', errors);
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  console.log('✅ Environment validation passed');
};

export default env;
