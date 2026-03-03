import { Badge } from '~/components/ui/badge';
import type { BackupStatus } from '~/types/backup.types';

const statusConfig: Record<BackupStatus, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PENDING: { label: 'Pendente', variant: 'secondary' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'outline' },
  COMPLETED: { label: 'Concluído', variant: 'success' },
  FAILED: { label: 'Falhou', variant: 'destructive' },
  VALIDATING: { label: 'Validando', variant: 'warning' },
  VALIDATED: { label: 'Validado', variant: 'success' },
};

interface BackupStatusBadgeProps {
  status: BackupStatus;
}

export function BackupStatusBadge({ status }: BackupStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
