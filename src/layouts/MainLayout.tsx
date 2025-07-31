import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotificationCenter } from '../components/NotificationCenter';
import { useState } from 'react';

export function MainLayout() {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isOTPVerified');
    navigate('/login', { replace: true });
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        notifications={[]}
        unreadNotificationCount={0}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        onNotificationClick={() => {}}
        onMarkNotificationAsRead={() => {}}
        onMarkAllNotificationsAsRead={() => {}}
        onDeleteNotification={() => {}}
        NotificationCenter={NotificationCenter}
        user={{ name: 'User', email: 'user@example.com' }}
        onLogout={handleLogout}
        onHistoryClick={handleHistoryClick}
      />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
