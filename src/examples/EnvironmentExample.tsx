/**
 * ตัวอย่างการใช้งาน Environment Variables ใน API
 */

import React, { useEffect, useState } from 'react';
import { env, validateApiEnvironment, checkApiConnection } from '../api';

export const EnvironmentExample: React.FC = () => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // ตรวจสอบ environment
    const result = validateApiEnvironment();
    setValidationResult(result);

    // ตรวจสอบการเชื่อมต่อ API
    const checkConnection = async () => {
      const connected = await checkApiConnection();
      setIsConnected(connected);
    };

    checkConnection();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Environment Configuration</h1>

      {/* App Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🏢 App Information</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Name:</strong> {env.app.name}</div>
          <div><strong>Version:</strong> {env.app.version}</div>
          <div><strong>Environment:</strong> {env.app.environment}</div>
          <div><strong>Author:</strong> {env.app.author}</div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🔗 API Configuration</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Base URL:</strong> {env.api.baseUrl}</div>
          <div><strong>Version:</strong> {env.api.version}</div>
          <div><strong>Timeout:</strong> {env.api.timeout}ms</div>
          <div><strong>Connection:</strong> 
            {isConnected === null ? (
              <span className="text-yellow-600"> Checking...</span>
            ) : isConnected ? (
              <span className="text-green-600"> ✅ Connected</span>
            ) : (
              <span className="text-red-600"> ❌ Failed</span>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🏢 Company Information</h2>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div><strong>Name:</strong> {env.company.name}</div>
          <div><strong>Address:</strong> {env.company.address}</div>
          <div><strong>Phone:</strong> {env.company.phone}</div>
          <div><strong>Email:</strong> {env.company.email}</div>
          <div><strong>Website:</strong> {env.company.website}</div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🚩 Feature Flags</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Notifications:</strong> 
            {env.features.notifications ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
          <div>
            <strong>Analytics:</strong> 
            {env.features.analytics ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
          <div>
            <strong>Export:</strong> 
            {env.features.export ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
          <div>
            <strong>Bulk Operations:</strong> 
            {env.features.bulkOperations ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
        </div>
      </div>

      {/* Development Settings */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🛠️ Development Settings</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Dev Tools:</strong> 
            {env.dev.tools ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
          <div>
            <strong>Debug Mode:</strong> 
            {env.dev.debug ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
          <div>
            <strong>Mock API:</strong> 
            {env.dev.mockApi ? ' ✅ Enabled' : ' ❌ Disabled'}
          </div>
          <div>
            <strong>Production:</strong> 
            {env.isProduction() ? ' ✅ Yes' : ' ❌ No'}
          </div>
        </div>
      </div>

      {/* Upload Configuration */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📁 Upload Configuration</h2>
        <div className="text-sm space-y-1">
          <div><strong>Max File Size:</strong> {(env.upload.maxFileSize / 1024 / 1024).toFixed(1)} MB</div>
          <div><strong>Allowed Types:</strong> {env.upload.allowedTypes.join(', ')}</div>
          <div><strong>Static URL:</strong> {env.upload.staticUrl}</div>
        </div>
      </div>

      {/* Localization */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🌍 Localization</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Default Language:</strong> {env.i18n.defaultLanguage}</div>
          <div><strong>Supported Languages:</strong> {env.i18n.supportedLanguages.join(', ')}</div>
          <div><strong>Timezone:</strong> {env.i18n.defaultTimezone}</div>
          <div><strong>Currency:</strong> {env.i18n.defaultCurrency}</div>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className={`p-4 rounded-lg ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="text-lg font-semibold mb-2">
            {validationResult.isValid ? '✅ Validation Passed' : '❌ Validation Failed'}
          </h2>
          
          {validationResult.errors.length > 0 && (
            <div className="mb-2">
              <strong className="text-red-600">Errors:</strong>
              <ul className="list-disc ml-6 text-sm">
                {validationResult.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div>
              <strong className="text-yellow-600">Warnings:</strong>
              <ul className="list-disc ml-6 text-sm">
                {validationResult.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-yellow-600">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Example Usage */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💡 Example Usage</h2>
        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`// Import environment config
import { env } from './api';

// Check if feature is enabled
if (env.isFeatureEnabled('notifications')) {
  // Show notifications
}

// Get API configuration
const apiUrl = env.api.baseUrl;
const timeout = env.api.timeout;

// Check environment
if (env.isProduction()) {
  // Production specific code
} else {
  // Development specific code
}`}
        </pre>
      </div>
    </div>
  );
};

export default EnvironmentExample;
