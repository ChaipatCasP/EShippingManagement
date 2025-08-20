import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  Eye,
  CheckCircle,
  AlertCircle,
  Users,
  MessageCircle
} from 'lucide-react';

export interface CommunicationMessage {
  id: string;
  content: string;
  sender: 'shipping' | 'jagota';
  senderName: string;
  timestamp: Date;
  read: boolean;
  type: 'general' | 'urgent';
  attachments?: string[];
}

interface User {
  email: string;
  name: string;
}

interface CommunicationPanelProps {
  messages: CommunicationMessage[];
  onSendMessage: (content: string, type: 'general' | 'urgent') => void;
  onMarkAsRead: (messageId: string) => void;
  disabled?: boolean;
  title?: string;
  placeholder?: string;
  user?: User | null;
}

// Utility function to generate avatar initials from name
const getAvatarInitials = (name: string): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  
  return name.charAt(0).toUpperCase();
};

// Utility function to get avatar background color based on name
const getAvatarBgColor = (name: string): string => {
  const colors = [
    'bg-blue-500 text-white',
    'bg-green-500 text-white', 
    'bg-purple-500 text-white',
    'bg-orange-500 text-white',
    'bg-pink-500 text-white',
    'bg-teal-500 text-white',
    'bg-indigo-500 text-white',
    'bg-red-500 text-white'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export function CommunicationPanel({
  messages,
  onSendMessage,
  onMarkAsRead,
  disabled = false,
  title = "Communication Messages",
  placeholder = "Type your message to JAGOTA...",
  user
}: CommunicationPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'general' | 'urgent'>('general');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim() && !disabled) {
      onSendMessage(newMessage.trim(), messageType);
      setNewMessage('');
      setMessageType('general');
      setIsTyping(false);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    setIsTyping(value.trim().length > 0);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <MessageCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const unreadCount = messages.filter(m => !m.read && m.sender === 'jagota').length;
  const currentUserName = user?.name || 'User';
  const currentUserInitials = getAvatarInitials(currentUserName);
  const currentUserBgColor = getAvatarBgColor(currentUserName);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <CardTitle className="text-base">{title}</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs h-5 px-2">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Real-time communication with JAGOTA Import Division
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Message History
          </div>
          
          <ScrollArea className="h-64 border rounded-lg bg-gray-50 p-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation below</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex gap-3 ${message.sender === 'shipping' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for JAGOTA messages */}
                    {message.sender === 'jagota' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/placeholder-jagota-avatar.png" />
                        <AvatarFallback className="bg-green-600 text-white text-xs font-semibold">
                          J
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${message.sender === 'shipping' ? 'order-last' : ''}`}>
                      {/* Message Bubble */}
                      <div className={`rounded-lg border-l-4 p-3 ${getMessageTypeColor(message.type)} ${
                        message.sender === 'shipping' 
                          ? 'bg-blue-500 text-white border-l-blue-600' 
                          : ''
                      }`}>
                        {/* Message Type Indicator */}
                        {message.type !== 'general' && (
                          <div className="flex items-center gap-1 mb-1">
                            {getMessageTypeIcon(message.type)}
                            <span className="text-xs font-medium capitalize">{message.type}</span>
                          </div>
                        )}
                        
                        <p className={`text-sm ${message.sender === 'shipping' ? 'text-white' : 'text-gray-900'}`}>
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Message Meta */}
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {message.sender === 'shipping' ? message.senderName : 'JAGOTA'}
                          </span>
                          <span>•</span>
                          <span>{formatTimestamp(message.timestamp)}</span>
                        </div>
                        
                        {!message.read && message.sender === 'jagota' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(message.id)}
                            className="h-auto p-0 text-blue-500 hover:text-blue-700"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Avatar for Shipping messages */}
                    {message.sender === 'shipping' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/placeholder-shipping-avatar.png" />
                        <AvatarFallback className={`text-xs font-semibold ${currentUserBgColor}`}>
                          {currentUserInitials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <Separator />
        
        {/* New Message Composition */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/placeholder-shipping-avatar.png" />
                <AvatarFallback className={`text-xs font-semibold ${currentUserBgColor}`}>
                  {currentUserInitials}
                </AvatarFallback>
              </Avatar>
              <span>Send to JAGOTA as {currentUserName}</span>
            </div>
            
            {/* Message Type Selector */}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                type="button"
                variant={messageType === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageType('general')}
                className="h-7 px-2 text-xs"
                disabled={disabled}
              >
                General
              </Button>
              <Button
                type="button"
                variant={messageType === 'urgent' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setMessageType('urgent')}
                className="h-7 px-2 text-xs"
                disabled={disabled}
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Urgent
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Textarea
              placeholder={placeholder}
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              rows={3}
              className="flex-1 resize-none"
              disabled={disabled}
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || disabled}
              className="self-end h-12 w-12 p-0"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-dotsLoading"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-dotsLoading" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-dotsLoading" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span>Sending message to JAGOTA...</span>
            </div>
          )}
        </div>
        
        {/* Communication Status */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>All communications with JAGOTA are logged and time-stamped for record keeping</span>
        </div>
      </CardContent>
    </Card>
  );
}