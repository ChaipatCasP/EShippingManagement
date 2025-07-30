/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_APP_AUTHOR: string;
  readonly VITE_APP_ENV: string;

  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_VERSION: string;
  readonly VITE_API_TIMEOUT: string;

  // Authentication
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string;
  readonly VITE_AUTH_TOKEN_EXPIRY: string;
  readonly VITE_SESSION_TIMEOUT: string;

  // File Upload
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_FILE_TYPES: string;
  readonly STATIC_FILES_URL: string;

  // Google Services
  readonly GOOGLE_MAPS_API_KEY: string;
  readonly GOOGLE_ANALYTICS_ID: string;

  // Payment
  readonly STRIPE_PUBLISHABLE_KEY: string;

  // Development
  readonly VITE_DEV_TOOLS: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_MOCK_API: string;

  // Feature Flags
  readonly VITE_FEATURE_NOTIFICATIONS: string;
  readonly VITE_FEATURE_ANALYTICS: string;
  readonly VITE_FEATURE_EXPORT: string;
  readonly VITE_FEATURE_BULK_OPERATIONS: string;
  readonly VITE_FEATURE_ADVANCED_FILTERS: string;

  // Localization
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_SUPPORTED_LANGUAGES: string;
  readonly VITE_DEFAULT_TIMEZONE: string;
  readonly VITE_DEFAULT_CURRENCY: string;

  // Company Information
  readonly VITE_COMPANY_NAME: string;
  readonly VITE_COMPANY_ADDRESS: string;
  readonly VITE_COMPANY_PHONE: string;
  readonly VITE_COMPANY_EMAIL: string;
  readonly VITE_COMPANY_WEBSITE: string;

  // Social Media
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_TWITTER_URL: string;
  readonly VITE_LINKEDIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
