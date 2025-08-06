import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Bell, User, LogOut, Settings, Clock, BarChart3 } from 'lucide-react';
import jagotaLogo from '../assets/img/jagota.jpg';
import type { Notification } from '../types/shipment';

interface HeaderProps {
  notifications: Notification[];
  unreadNotificationCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  NotificationCenter: React.ComponentType<any>;
  user: any;
  onLogout: () => void;
  onHistoryClick?: () => void;
}

export function Header({ 
  notifications, 
  unreadNotificationCount, 
  isNotificationOpen, 
  setIsNotificationOpen,
  onNotificationClick,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  NotificationCenter,
  user,
  onLogout,
  onHistoryClick
}: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
                <img 
                  src={jagotaLogo} 
                  alt="JAGOTA Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">JAGOTA Shipping Dashboard</h1>
                <p className="text-xs text-gray-600">Import Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* History Button */}
            {onHistoryClick && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onHistoryClick}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                History
              </Button>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotificationCount}
                  </Badge>
                )}
              </Button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <NotificationCenter
                    notifications={notifications}
                    onClose={() => setIsNotificationOpen(false)}
                    onNotificationClick={onNotificationClick}
                    onMarkAsRead={onMarkNotificationAsRead}
                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                    onDelete={onDeleteNotification}
                  />
                </div>
              )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/user.png" alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(user?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.company || 'Shipping Company'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {onHistoryClick && (
                  <DropdownMenuItem onClick={onHistoryClick} className="cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Shipment History</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="cursor-pointer">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}