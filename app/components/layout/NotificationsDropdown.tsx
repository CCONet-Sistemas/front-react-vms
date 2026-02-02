import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, Video } from 'lucide-react';
import { useNotificationsStore, selectNotifications, selectUnreadNotificationCount } from '~/store';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { NotificationType } from '~/types/notification.types';

const notificationIcons: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  event: Video,
};

const notificationColors: Record<NotificationType, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  event: 'text-primary',
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notifications = useNotificationsStore(selectNotifications);
  const unreadCount = useNotificationsStore(selectUnreadNotificationCount);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const removeNotification = useNotificationsStore((s) => s.removeNotification);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    if (actionUrl) {
      setIsOpen(false);
      navigate(actionUrl);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificações"
        aria-expanded={isOpen}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-80 rounded-md border bg-card shadow-lg',
            'animate-in fade-in-0 zoom-in-95'
          )}
          role="menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">Notificações</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  title="Limpar todas"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notification) => {
                const Icon = notificationIcons[notification.type];
                const iconColor = notificationColors[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer',
                      'hover:bg-accent/50 transition-colors',
                      !notification.read && 'bg-accent/30'
                    )}
                    onClick={() => handleNotificationClick(notification.id, notification.metadata?.actionUrl)}
                    role="menuitem"
                  >
                    <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColor)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-medium truncate', !notification.read && 'font-semibold')}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 hover:bg-accent rounded-sm flex-shrink-0"
                        title="Marcar como lida"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 20 && (
            <div className="px-4 py-2 border-t text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-xs text-primary hover:underline"
              >
                Ver todas ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
