# E-Shipping Management API Documentation

ระบบ API สำหรับจัดการข้อมูลการจัดส่งสินค้า (E-Shipping Management System) ที่สร้างด้วย React TypeScript

## 🚀 การติดตั้งและใช้งาน

### 1. การนำเข้า API

```typescript
import { 
  ApiProvider, 
  useAuth, 
  useShipments, 
  ShipmentService,
  AuthService 
} from './src/api';
```

### 2. การตั้งค่า Provider

```tsx
import { ApiProvider } from './src/api';

function App() {
  return (
    <ApiProvider baseURL="https://your-api-domain.com/api">
      <YourAppComponents />
    </ApiProvider>
  );
}
```

## 📡 API Services

### Authentication Service

```typescript
import { AuthService } from './src/api';

// เข้าสู่ระบบ
const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

// ออกจากระบบ
await AuthService.logout();

// ดึงข้อมูลผู้ใช้ปัจจุบัน
const user = await AuthService.getCurrentUser();
```

### Shipment Service

```typescript
import { ShipmentService } from './src/api';

// สร้างการจัดส่งใหม่
const shipment = await ShipmentService.createShipment({
  recipientName: 'John Doe',
  recipientPhone: '+1234567890',
  shippingAddress: {
    street: '123 Main St',
    city: 'Bangkok',
    state: 'Bangkok',
    postalCode: '10110',
    country: 'Thailand'
  },
  items: [{
    name: 'Product Name',
    quantity: 1,
    weight: 1.5,
    value: 100
  }],
  serviceType: 'standard',
  packageType: 'box',
  weight: 1.5,
  dimensions: { length: 20, width: 15, height: 10, unit: 'cm' },
  value: 100,
  currency: 'THB'
});

// ดึงรายการการจัดส่ง
const shipments = await ShipmentService.getShipments(
  { status: ['pending', 'in_transit'] }, // filters
  { page: 1, limit: 10 } // pagination
);

// ติดตามการจัดส่ง
const tracking = await ShipmentService.trackShipment('TRACK123456');

// อัปเดตสถานะ
await ShipmentService.updateShipmentStatus(
  'shipment-id', 
  'in_transit', 
  'Package picked up'
);
```

### Dashboard Service

```typescript
import { DashboardService } from './src/api';

// ดึงสถิติ Dashboard
const stats = await DashboardService.getDashboardStats();

// ดึงการแจ้งเตือน
const notifications = await DashboardService.getNotifications();

// ทำเครื่องหมายแจ้งเตือนว่าอ่านแล้ว
await DashboardService.markNotificationAsRead('notification-id');
```

## 🎣 React Hooks

### useAuth Hook

```tsx
import { useAuth } from './src/api';

function LoginComponent() {
  const { user, login, logout, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result?.success) {
      console.log('Login successful!');
    }
  };

  if (isAuthenticated) {
    return <div>Welcome, {user?.firstName}!</div>;
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

### useShipments Hook

```tsx
import { useShipments } from './src/api';

function ShipmentsPage() {
  const { 
    data: shipments, 
    isLoading, 
    error, 
    refetch 
  } = useShipments(
    { status: ['pending'] }, // filters
    { page: 1, limit: 20 }   // pagination
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {shipments.map(shipment => (
        <div key={shipment.id}>
          {shipment.trackingNumber} - {shipment.status}
        </div>
      ))}
    </div>
  );
}
```

### useDashboardStats Hook

```tsx
import { useDashboardStats } from './src/api';

function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div>Total Shipments: {stats?.totalShipments}</div>
      <div>Revenue: ${stats?.totalRevenue}</div>
    </div>
  );
}
```

### useNotifications Hook

```tsx
import { useNotifications } from './src/api';

function NotificationCenter() {
  const { 
    data: notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <div>
      <h3>Notifications ({unreadCount} unread)</h3>
      <button onClick={markAllAsRead}>Mark All as Read</button>
      {notifications.map(notification => (
        <div 
          key={notification.id}
          onClick={() => markAsRead(notification.id)}
          className={notification.isRead ? 'read' : 'unread'}
        >
          {notification.title}
        </div>
      ))}
    </div>
  );
}
```

## 🔒 Authentication & Authorization

### การใช้งาน withAuth HOC

```tsx
import { withAuth } from './src/api';

const ProtectedComponent = withAuth(function Dashboard() {
  return <div>This is a protected page</div>;
});
```

### การตรวจสอบ Authentication

```tsx
import { useApiContext } from './src/api';

function App() {
  const { isAuthenticated, user, isLoading } = useApiContext();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}
```

## 🎯 Types และ Interfaces

### ตัวอย่าง Types ที่สำคัญ

```typescript
interface ShipmentRequest {
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  shippingAddress: Address;
  items: ShipmentItem[];
  serviceType: 'standard' | 'express' | 'overnight' | 'economy';
  packageType: 'envelope' | 'box' | 'tube' | 'pallet' | 'custom';
  weight: number;
  dimensions: Dimensions;
  value: number;
  currency: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShipmentItem {
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  value: number;
}
```

## ⚙️ การตั้งค่าและปรับแต่ง

### การตั้งค่า Base URL

```typescript
import { apiClient } from './src/api';

// ตั้งค่า base URL
const client = new ApiClient('https://your-api-domain.com/api');

// หรือใช้ provider
<ApiProvider baseURL="https://your-api-domain.com/api">
  <App />
</ApiProvider>
```

### การจัดการ Token

```typescript
import { apiClient } from './src/api';

// ตั้งค่า token
apiClient.setAuthToken('your-jwt-token');

// ดึง token ปัจจุบัน
const token = apiClient.getAuthToken();

// ลบ token
apiClient.setAuthToken(null);
```

## 🔄 การจัดการ Error

```typescript
import { handleApiError, isApiError } from './src/api';

try {
  const response = await ShipmentService.getShipments();
} catch (error) {
  if (isApiError(error)) {
    console.error('API Error:', error.message, error.status);
  } else {
    console.error('Unknown error:', handleApiError(error));
  }
}
```

## 📤 การ Upload ไฟล์

```typescript
import { apiClient } from './src/api';

const file = document.querySelector('input[type="file"]').files[0];
const response = await apiClient.uploadFile('/shipments/upload-document', file, {
  shipmentId: 'shipment-123',
  documentType: 'invoice'
});
```

## 🔍 การค้นหาและกรอง

```typescript
// ค้นหาการจัดส่ง
const searchResults = await ShipmentService.searchShipments('tracking123');

// กรองการจัดส่ง
const filtered = await ShipmentService.getShipments({
  status: ['pending', 'in_transit'],
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  search: 'john doe'
});
```

## 📊 Export ข้อมูล

```typescript
// Export เป็น CSV
const csvExport = await ShipmentService.exportShipments('csv', {
  status: ['delivered'],
  dateFrom: '2024-01-01'
});

// Download URL จะอยู่ใน response.data.url
```

## 🚨 Error Handling Best Practices

1. **ใช้ try-catch สำหรับ async operations**
2. **ตรวจสอบ response.success ก่อนใช้ data**  
3. **แสดง error message ที่เหมาะสม**
4. **จัดการ network errors และ timeouts**

## 📝 การใช้งานจริง

ดูตัวอย่างการใช้งานเต็มรูปแบบได้ที่ `src/examples/ApiUsageExample.tsx`

## 🔧 การพัฒนาต่อ

หากต้องการเพิ่ม API endpoints ใหม่:

1. เพิ่ม types ใน `src/api/types.ts`
2. สร้าง service ใหม่ใน `src/api/services/`
3. เพิ่ม hooks ใน `src/api/hooks/useApi.ts`
4. Export ใน `src/api/index.ts`
