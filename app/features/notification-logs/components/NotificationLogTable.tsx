import { Eye, RotateCcw } from 'lucide-react';
import { TableSkeleton } from '~/components/ui/table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { NotificationLogStatusBadge } from './NotificationLogStatusBadge';
import type { NotificationLog } from '~/types/notification-log.types';

const channelLabels: Record<string, string> = {
  email: 'E-mail',
  sms: 'SMS',
  push: 'Push',
  webhook: 'Webhook',
};

function getRecipient(log: NotificationLog): string {
  return (
    log.recipient_email ??
    log.recipient_phone ??
    log.recipient_device_token ??
    log.recipient_webhook_url ??
    '--'
  );
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface NotificationLogTableProps {
  logs: NotificationLog[];
  onRetry: (log: NotificationLog) => void;
  onViewDetail: (log: NotificationLog) => void;
  isLoading?: boolean;
  isRetrying?: boolean;
}

export function NotificationLogTable({
  logs,
  onRetry,
  onViewDetail,
  isLoading,
  isRetrying,
}: NotificationLogTableProps) {
  if (isLoading) {
    return <TableSkeleton rows={8} columns={6} />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Canal</TableHead>
            <TableHead>Destinatário</TableHead>
            <TableHead>Assunto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data envio</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhuma notificação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {channelLabels[log.channel] ?? log.channel}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{getRecipient(log)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.subject ?? '--'}
                </TableCell>
                <TableCell>
                  <NotificationLogStatusBadge status={log.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(log.sent_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onViewDetail(log)}
                      tooltip={true}
                      tooltipText="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {log.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRetry(log)}
                        disabled={isRetrying}
                        tooltip={true}
                        tooltipText="Tentar novamente"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
