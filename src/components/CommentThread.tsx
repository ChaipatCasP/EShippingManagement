import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  MessageCircle,
  Tag,
  AtSign,
  File,
  Image,
  Download,
  MoreHorizontal
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  role: string;
  content: string;
  timestamp: string;
  type: 'user' | 'system';
  messageType: 'internal' | 'external';
  tags: string[];
  mentions: string[];
  attachments?: {
    id: string;
    name: string;
    type: 'file' | 'image';
    size: string;
    url: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface CommentThreadProps {
  poNumber: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'isRead'>) => void;
  messageMode: 'internal' | 'external';
  currentUser: string;
}

const tagColors = {
  'Action Required': 'bg-red-100 text-red-800 border-red-200',
  'Follow Up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Information': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Urgent': 'bg-orange-100 text-orange-800 border-orange-200'
};

export function CommentThread({ 
  poNumber, 
  comments, 
  onAddComment, 
  messageMode, 
  currentUser 
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTags = ['Action Required', 'Follow Up', 'Information', 'Resolved', 'Urgent'];
  const availableUsers = ['Sarah Chen', 'Mike Rodriguez', 'Jennifer Kim', 'David Mueller', 'Lisa Wong'];

  const filteredComments = comments.filter(comment => 
    messageMode === 'internal' ? comment.messageType === 'internal' : comment.messageType === 'external'
  );

  useEffect(() => {
    if (textareaRef.current && newComment.includes('@')) {
      const words = newComment.split(' ');
      const lastWord = words[words.length - 1];
      if (lastWord.startsWith('@') && lastWord.length > 1) {
        const query = lastWord.slice(1).toLowerCase();
        const suggestions = availableUsers.filter(user => 
          user.toLowerCase().includes(query)
        );
        setMentionSuggestions(suggestions);
        setShowMentions(suggestions.length > 0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [newComment]);

  const handleSubmit = () => {
    if (!newComment.trim() && attachments.length === 0) return;

    const mentions = newComment.match(/@(\w+(?:\s+\w+)*)/g)?.map(m => m.slice(1)) || [];
    
    onAddComment({
      author: currentUser,
      role: 'Logistics Coordinator',
      content: newComment,
      type: 'user',
      messageType: messageMode,
      tags: selectedTags,
      mentions,
      attachments: attachments.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file)
      })),
      priority: selectedTags.includes('Urgent') ? 'high' : 
               selectedTags.includes('Action Required') ? 'medium' : 'low'
    });

    setNewComment('');
    setSelectedTags([]);
    setAttachments([]);
  };

  const handleMentionSelect = (user: string) => {
    const words = newComment.split(' ');
    words[words.length - 1] = `@${user}`;
    setNewComment(words.join(' ') + ' ');
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">
            Communication - {poNumber}
          </h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {messageMode === 'internal' ? 'Internal Notes' : 'External Messages'}
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No {messageMode} messages yet</p>
              <p className="text-sm">Start the conversation below</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div key={comment.id} className={`flex gap-3 ${!comment.isRead ? 'bg-blue-50 p-2 rounded-lg' : ''}`}>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </div>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500">{comment.role}</span>
                      {comment.type === 'system' && (
                        <Badge variant="outline" className="text-xs">System</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  {comment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {comment.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          className={`text-xs ${tagColors[tag as keyof typeof tagColors] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                    {comment.content.split(/(@\w+(?:\s+\w+)*)/).map((part, index) => 
                      part.startsWith('@') ? (
                        <span key={index} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </div>

                  {/* Attachments */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {comment.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          {attachment.type === 'image' ? (
                            <Image className="w-4 h-4 text-blue-600" />
                          ) : (
                            <File className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-sm text-gray-700 flex-1">{attachment.name}</span>
                          <span className="text-xs text-gray-500">{attachment.size}</span>
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="flex gap-1">
                      {comment.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          {reaction.emoji} {reaction.count}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        {/* Tags */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => toggleTag(tag)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                  <File className="w-3 h-3" />
                  <span>{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-4 h-4 p-0 ml-1"
                    onClick={() => removeAttachment(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Add ${messageMode} note... Use @ to mention team members`}
            className="min-h-[80px] pr-20 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          {/* Mention Suggestions */}
          {showMentions && (
            <div className="absolute bottom-full left-0 mb-1 bg-white border rounded-lg shadow-lg z-10 min-w-48">
              {mentionSuggestions.map((user) => (
                <Button
                  key={user}
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto"
                  onClick={() => handleMentionSelect(user)}
                >
                  <AtSign className="w-4 h-4 mr-2" />
                  {user}
                </Button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleSubmit}
              disabled={!newComment.trim() && attachments.length === 0}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Ctrl+Enter to send</span>
          <span>{newComment.length}/1000</span>
        </div>
      </div>
    </div>
  );
}