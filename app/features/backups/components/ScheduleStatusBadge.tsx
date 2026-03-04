import { Badge } from '~/components/ui/badge';

interface ScheduleStatusBadgeProps {
  enabled: boolean;
}

export function ScheduleStatusBadge({ enabled }: ScheduleStatusBadgeProps) {
  return enabled ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="secondary">Inativo</Badge>
  );
}
