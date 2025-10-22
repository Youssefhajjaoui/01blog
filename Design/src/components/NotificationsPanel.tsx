import React from 'react';
import { X, Check, Heart, MessageCircle, UserPlus, Edit, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import type { Notification } from '../App';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export function NotificationsPanel({ notifications, onClose, onMarkAllRead }: NotificationsPanelProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'subscribe':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'post':
        return <Edit className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-16 right-4 w-80 bg-card border shadow-lg rounded-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.read) && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll see updates from people you follow here
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <span className="font-medium text-sm">{notification.user.name}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        {notification.post && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            "{notification.post.title}"
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}