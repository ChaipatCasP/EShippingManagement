import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import Dashboard from '../pages/Dashboard';
import CreatePSTPage from '../pages/CreatePSTPage';
import CreatePSWPage from '../pages/CreatePSWPage';
import LoginPage from '../pages/LoginPage';
import OTPPage from '../pages/OTPPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'otp',
        element: <OTPPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'create-pst',
        element: <CreatePSTPage />,
      },
      {
        path: 'create-pst/:poNumber',
        element: <CreatePSTPage />,
      },
      {
        path: 'create-psw',
        element: <CreatePSWPage />,
      },
      {
        path: 'create-psw/:poNumber',
        element: <CreatePSWPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
