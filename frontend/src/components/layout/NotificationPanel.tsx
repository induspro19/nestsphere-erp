import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { notificationsApi, AppNotification } from '../../api/notifications.api';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getUserNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.meta.unreadCount || 0);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch {
      // Fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card/95 backdrop-blur-2xl border-l border-border/40 shadow-2xl flex flex-col transition-all">
      {/* Header */}
      <div className="h-16 px-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-ping" />
            )}
          </div>
          <h3 className="font-bold text-base font-display">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
            <Bell className="h-8 w-8 mx-auto opacity-40" />
            <p>You have zero unread notifications.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.isRead
                  ? 'bg-accent/10 border-border/20'
                  : 'bg-card border-primary/20 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] px-1.5">
                      {item.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className={`text-xs ${item.isRead ? 'font-medium' : 'font-bold text-foreground'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                </div>
                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="h-6 w-6 rounded-md hover:bg-accent/60 shrink-0"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
