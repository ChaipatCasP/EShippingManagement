import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Shipping Management</h1>
          <p className="text-gray-600">ระบบจัดการการจัดส่งสินค้า</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
