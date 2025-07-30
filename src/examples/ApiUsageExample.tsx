/**
 * ตัวอย่างการใช้งาน API พร้อม Environment Variables
 */

import React, { useState } from 'react';
import { 
  ApiProvider, 
  useAuth, 
  useShipments, 
  useDashboardStats,
  ShipmentService,
  handleApiError,
  env
} from '../api';

// ตัวอย่างการใช้งาน Authentication
function LoginExample() {
  const { login, isLoading, error, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result?.success) {
      console.log('Login successful!');
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome, {user?.firstName}!</h2>
        <p>You are logged in.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

// ตัวอย่างการใช้งาน Shipments
function ShipmentsExample() {
  const { data: shipments, isLoading, error, refetch } = useShipments(
    { status: ['pending', 'in_transit'] }, // filters
    { page: 1, limit: 10 } // pagination
  );

  if (isLoading) return <div>Loading shipments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Shipments</h2>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {shipments.map(shipment => (
          <li key={shipment.id}>
            {shipment.trackingNumber} - {shipment.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ตัวอย่างการใช้งาน Dashboard
function DashboardExample() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Dashboard Stats</h2>
      <div>
        <p>Total Shipments: {stats?.totalShipments}</p>
        <p>Pending: {stats?.pendingShipments}</p>
        <p>In Transit: {stats?.inTransitShipments}</p>
        <p>Delivered: {stats?.deliveredShipments}</p>
        <p>Revenue: ${stats?.totalRevenue}</p>
      </div>
    </div>
  );
}

// ตัวอย่างการสร้าง Shipment
function CreateShipmentExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleCreateShipment = async () => {
    try {
      setIsLoading(true);
      const shipmentData = {
        recipientName: 'John Doe',
        recipientPhone: '+1234567890',
        recipientEmail: 'john@example.com',
        shippingAddress: {
          street: '123 Main St',
          city: 'Bangkok',
          state: 'Bangkok',
          postalCode: '10110',
          country: 'Thailand'
        },
        items: [
          {
            name: 'Sample Item',
            description: 'A sample item for testing',
            quantity: 1,
            weight: 1.5,
            value: 100
          }
        ],
        serviceType: 'standard' as const,
        packageType: 'box' as const,
        weight: 1.5,
        dimensions: {
          length: 20,
          width: 15,
          height: 10,
          unit: 'cm' as const
        },
        value: 100,
        currency: 'THB'
      };

      const response = await ShipmentService.createShipment(shipmentData);
      if (response.success) {
        setResult(`Shipment created! Tracking: ${response.data.trackingNumber}`);
      }
    } catch (error) {
      setResult(`Error: ${handleApiError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Shipment</h2>
      <button onClick={handleCreateShipment} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Sample Shipment'}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}

// ตัวอย่างการใช้งาน Provider พร้อม environment config
function AppExample() {
  return (
    <ApiProvider> {/* ใช้ baseURL จาก env โดยอัตโนมัติ */}
      <div>
        <h1>{env.app.name} - API Example</h1>
        <p>Environment: {env.app.environment}</p>
        <p>API Base URL: {env.api.baseUrl}</p>
        <p>Company: {env.company.name}</p>
        <hr />
        <LoginExample />
        <hr />
        <DashboardExample />
        <hr />
        <ShipmentsExample />
        <hr />
        <CreateShipmentExample />
      </div>
    </ApiProvider>
  );
}

export default AppExample;
