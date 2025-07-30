import { useState } from 'react';
import { mockNotifications, mockComments } from '../data/mockData';
import type { Notification, Comment } from '../types/shipment';

export function useNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [comments, setComments] = useState(mockComments);

  const handleAddComment = (poNumber: string, comment: any) => {
    const newComment = {
      ...comment,
      id: `c${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setComments(prev => ({
      ...prev,
      [poNumber]: [...(prev[poNumber] || []), newComment]
    }));

    // Create notification for mentions
    if (comment.mentions.length > 0) {
      const notification = {
        id: `n${Date.now()}`,
        type: 'mention' as const,
        title: `You were mentioned in ${poNumber}`,
        message: `${comment.author}: ${comment.content.slice(0, 100)}...`,
        poNumber,
        author: comment.author,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: comment.priority,
        actionRequired: comment.tags.includes('Action Required')
      };
      
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getCommentCounts = (poNumber: string) => {
    const poComments = comments[poNumber] || [];
    return {
      internal: poComments.filter(c => c.messageType === 'internal').length,
      external: poComments.filter(c => c.messageType === 'external').length
    };
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    comments,
    unreadNotificationCount,
    handleAddComment,
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
    handleDeleteNotification,
    getCommentCounts
  };
}