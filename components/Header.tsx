import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Bell, Calendar, User, LogOut, Settings, HelpCircle, Home, Inbox, FileText } from 'lucide-react';
import jagotaLogo from 'figma:asset/ff4cc62167f856df08ea3a5c273f5de4c69e10c7.png';

interface HeaderProps {
  notifications?: any[];
  unreadNotificationCount?: number;
  isNotificationOpen?: boolean;
  setIsNotificationOpen?: (open: boolean) => void;
  onNotificationClick?: (notification: any) => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  NotificationCenter?: React.ComponentType<any>;
  user?: { email: string; name: string } | null;
  onLogout?: () => void;
}

export function Header({
  notifications = [],
  unreadNotificationCount = 0,
  isNotificationOpen = false,
  setIsNotificationOpen = () => {},
  onNotificationClick = () => {},
  onMarkNotificationAsRead = () => {},
  onMarkAllNotificationsAsRead = () => {},
  onDeleteNotification = () => {},
  NotificationCenter,
  user,
  onLogout = () => {}
}: HeaderProps) {
  const [activeNavItem, setActiveNavItem] = useState('Home');

  const navigationItems = [
    { name: 'Home', icon: Home, active: true },
    { name: 'Inbox', icon: Inbox, active: false },
    { name: 'Apply Permit', icon: FileText, active: false }
  ];

  const handleNavClick = (itemName: string) => {
    setActiveNavItem(itemName);
    // Add navigation logic here
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Guest User';
    return user.name || user.email.split('@')[0];
  };

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      {/* Main Header - Minimal single line */}
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section - Small minimal logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <img 
                src={jagotaLogo} 
                alt="JAGOTA" 
                className="h-6 w-auto object-contain"
                style={{
                  filter: 'contrast(2) brightness(0.2)'
                }}
              />
            </div>
            <div className="text-base font-medium text-gray-900">
              JAGOTA eShipping
            </div>
          </div>

          {/* Center Navigation - Minimal style */}
          <nav className="flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavItem === item.name;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center space-x-1 px-2 py-1 text-sm font-medium transition-colors rounded-md ${
                    isActive
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section - Compact actions */}
          <div className="flex items-center space-x-2">
            {/* Notification */}
            {NotificationCenter && (
              <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900 h-8 w-8 p-0">
                    <Bell className="w-4 h-4" />
                    {unreadNotificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full border border-white">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="end">
                  <NotificationCenter
                    notifications={notifications}
                    onMarkAsRead={onMarkNotificationAsRead}
                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                    onDeleteNotification={onDeleteNotification}
                    onNotificationClick={onNotificationClick}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-8 px-2">
                  <User className="w-4 h-4 mr-1" />
                  <span className="text-sm">{getUserDisplayName()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'guest@jagota.com'}</p>
                </div>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}