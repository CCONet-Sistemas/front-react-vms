import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContent,
  PageHeader,
  ProtectedRoute,
  FilterBar,
  Pagination,
} from '~/components/common';
import { Button } from '~/components/ui/button';
import {
  NotificationLogTable,
  NotificationLogDetailDialog,
  useNotificationLogList,
  useRetryNotification,
} from '~/features/notification-logs';
import { useListParams } from '~/hooks/useListParams';
import type { NotificationLog, NotificationChannel, NotificationLogStatus } from '~/types/notification-log.types';

export function meta() {
  return [
    { title: 'Notificações | VMS' },
    { name: 'description', content: 'Logs de notificações enviadas - Video Management System' },
  ];
}

export default function SettingsNotificationsPage() {
  const { params, setPage } = useListParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  const channel = (searchParams.get('channel') as NotificationChannel) || undefined;
  const status = (searchParams.get('status') as NotificationLogStatus) || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const { data, isLoading } = useNotificationLogList({
    page: Number(params.page),
    limit: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
    channel,
    status,
    startDate,
    endDate,
  });

  const retryNotification = useRetryNotification();

  const logs = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 0;

  const handleRetry = useCallback(
    async (log: NotificationLog) => {
      try {
        await retryNotification.mutateAsync(log.uuid);
        toast.success('Notificação reenviada com sucesso!');
      } catch {
        toast.error('Erro ao reenviar notificação');
      }
    },
    [retryNotification]
  );

  return (
    <ProtectedRoute permission="notification:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Notificações Enviadas"
            description="Visualize e gerencie os logs de notificações enviadas pelo servidor"
          >
            <Button onClick={() => navigate('/settings/notifications/send')}>
              <Plus className="h-4 w-4 mr-2" />
              Enviar Notificação
            </Button>
          </PageHeader>

          <FilterBar
            placeholder="Buscar notificações..."
            fields={[
              {
                type: 'select',
                key: 'channel',
                placeholder: 'Todos os canais',
                options: [
                  { label: 'E-mail', value: 'email' },
                  { label: 'SMS', value: 'sms' },
                  { label: 'Push', value: 'push' },
                  { label: 'Webhook', value: 'webhook' },
                ],
              },
              {
                type: 'select',
                key: 'status',
                placeholder: 'Todos os status',
                options: [
                  { label: 'Pendente', value: 'pending' },
                  { label: 'Enviado', value: 'sent' },
                  { label: 'Falhou', value: 'failed' },
                  { label: 'Reprocessando', value: 'retry' },
                ],
              },
              { type: 'daterange' },
            ]}
          />

          <NotificationLogTable
            logs={logs}
            onRetry={handleRetry}
            onViewDetail={setSelectedLog}
            isLoading={isLoading}
            isRetrying={retryNotification.isPending}
          />

          {totalPages > 0 && (
            <Pagination
              page={data?.meta?.current_page ?? Number(params.page)}
              totalPages={totalPages}
              total={total}
              limit={data?.meta?.per_page ?? Number(params.per_page)}
              onPageChange={setPage}
            />
          )}
        </div>

        <NotificationLogDetailDialog
          log={selectedLog}
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      </PageContent>
    </ProtectedRoute>
  );
}
