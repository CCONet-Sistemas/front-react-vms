import { Badge } from '~/components/ui/badge';
import type { NotificationLogStatus } from '~/types/notification-log.types';

const statusConfig: Record<NotificationLogStatus, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  sent: { label: 'Enviado', variant: 'success' },
  failed: { label: 'Falhou', variant: 'destructive' },
  retry: { label: 'Reprocessando', variant: 'secondary' },
};

interface NotificationLogStatusBadgeProps {
  status: NotificationLogStatus;
}

export function NotificationLogStatusBadge({ status }: NotificationLogStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
