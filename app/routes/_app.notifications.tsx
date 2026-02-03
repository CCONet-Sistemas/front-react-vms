import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/_app.notifications';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Video,
  Filter,
  BellOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '~/components/ui';
import { PageContent, PageHeader } from '~/components/common';
import {
  useNotificationsStore,
  selectNotifications,
  selectUnreadNotificationCount,
} from '~/store';
import { cn } from '~/lib/utils';
import type { NotificationType, Notification } from '~/types/notification.types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Notificações | VMS' },
    { name: 'description', content: 'Central de notificações - Video Management System' },
  ];
}

type FilterType = 'all' | 'unread' | 'read';

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

const notificationBgColors: Record<NotificationType, string> = {
  info: 'bg-blue-500/10',
  success: 'bg-green-500/10',
  warning: 'bg-yellow-500/10',
  error: 'bg-red-500/10',
  event: 'bg-primary/10',
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onRemove,
  onClick,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];
  const bgColor = notificationBgColors[notification.type];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !notification.read && 'border-primary/50 bg-accent/30'
      )}
      onClick={() => onClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-lg', bgColor)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium', !notification.read && 'font-semibold')}>
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTime(notification.timestamp)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar como lida
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const navigate = useNavigate();

  const notifications = useNotificationsStore(selectNotifications);
  const unreadCount = useNotificationsStore(selectUnreadNotificationCount);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const removeNotification = useNotificationsStore((s) => s.removeNotification);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'read':
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.metadata?.actionUrl) {
      navigate(notification.metadata.actionUrl);
    }
  };

  const filterButtons: { value: FilterType; label: string; count?: number }[] = [
    { value: 'all', label: 'Todas', count: notifications.length },
    { value: 'unread', label: 'Não lidas', count: unreadCount },
    { value: 'read', label: 'Lidas', count: notifications.length - unreadCount },
  ];

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader title="Notificações" description="Central de notificações do sistema." />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Notificações
              </CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{notifications.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Não Lidas</CardTitle>
              <span className="flex h-2 w-2">
                {unreadCount > 0 && (
                  <>
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </>
                )}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lidas</CardTitle>
              <CheckCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">
                {notifications.length - unreadCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.value}
                  variant={filter === btn.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(btn.value)}
                  className="h-8"
                >
                  {btn.label}
                  {btn.count !== undefined && btn.count > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-background">
                      {btn.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar todas
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhuma notificação</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'unread'
                  ? 'Você não tem notificações não lidas.'
                  : filter === 'read'
                    ? 'Você não tem notificações lidas.'
                    : 'Suas notificações aparecerão aqui.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </PageContent>
  );
}
