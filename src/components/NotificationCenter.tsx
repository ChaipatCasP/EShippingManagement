import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Bell, 
  MessageCircle, 
  AtSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Filter,
  User,
  FileText,
  Package
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'mention' | 'comment' | 'system' | 'action' | 'update';
  title: string;
  message: string;
  poNumber: string;
  author?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

const notificationIcons = {
  mention: AtSign,
  comment: MessageCircle,
  system: Settings,
  action: AlertTriangle,
  update: Package
};

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500'
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNotificationClick
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.type === activeTab;
    const matchesRead = !showUnreadOnly || !notification.isRead;
    return matchesTab && matchesRead;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationCounts = () => {
    return {
      all: notifications.length,
      mention: notifications.filter(n => n.type === 'mention').length,
      comment: notifications.filter(n => n.type === 'comment').length,
      system: notifications.filter(n => n.type === 'system').length,
      action: notifications.filter(n => n.type === 'action').length
    };
  };

  const counts = getNotificationCounts();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={showUnreadOnly ? 'bg-blue-100 text-blue-700' : ''}
            >
              {showUnreadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all" className="relative">
              All
              {counts.all > 0 && (
                <Badge variant="secondary" className="text-xs ml-1 h-4 px-1">
                  {counts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mention">
              <AtSign className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="comment">
              <MessageCircle className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="action">
              <AlertTriangle className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type];
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 rounded-r-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        priorityColors[notification.priority]
                      } ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                      onClick={() => {
                        onNotificationClick(notification);
                        if (!notification.isRead) {
                          onMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'mention' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'comment' ? 'bg-green-100 text-green-600' :
                          notification.type === 'action' ? 'bg-red-100 text-red-600' :
                          notification.type === 'system' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="w-3 h-3" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Action
                                </Badge>
                              )}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.poNumber}
                              </Badge>
                              {notification.author && (
                                <span className="text-xs text-gray-500">
                                  by {notification.author}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-5 h-5 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}