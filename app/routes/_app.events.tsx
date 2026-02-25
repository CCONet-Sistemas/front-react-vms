import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import type { Route } from './+types/_app.events';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui';
import {
  FilterBar,
  PageContent,
  PageHeader,
  Pagination,
  ProtectedRoute,
  ViewModeToggle,
} from '~/components/common';
import { EventList, useEvents, useAcknowledgeEvent } from '~/features/events';
import { statusOptions } from '~/features/events/constants/eventTypes';
import { useCameras } from '~/features/cameras';
import { useListParams } from '~/hooks/useListParams';
import type { Event, EventFilters as EventFiltersType } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Eventos | VMS' },
    { name: 'description', content: 'Visualizar eventos - Video Management System' },
  ];
}

type ViewMode = 'grid' | 'list';

export default function EventsPage() {
  const { params, setPage } = useListParams({ defaults: { per_page: 12 } });
  const [searchParams] = useSearchParams();

  // Filtros específicos lidos da URL (gerenciados pelo FilterBar)
  const status = (searchParams.get('status') as EventFiltersType['status']) || undefined;
  const cameraId = searchParams.get('cameraId') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';

  // Carrega opções de câmeras para o FilterBar
  const { data: camerasData } = useCameras({ per_page: 100 });
  const cameraOptions = (camerasData?.data ?? []).map((c) => ({
    label: c.name,
    value: c.uuid,
  }));

  const { data, isLoading, error } = useEvents({
    page: Number(params.page),
    per_page: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
    status,
    cameraId,
    startDate,
    endDate,
  });

  const acknowledgeEvent = useAcknowledgeEvent();
  const navigate = useNavigate();
  const events = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 0;
  const newCount = events.filter((e) => e.status === 'new').length;

  const handleViewEvent = useCallback(
    (event: Event) => navigate(`/event/${event.uuid}`),
    [navigate]
  );

  const handleAcknowledgeEvent = useCallback(
    async (event: Event) => {
      try {
        await acknowledgeEvent.mutateAsync(event.uuid);
        toast.success('Evento confirmado com sucesso!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ocorreu um erro';
        toast.error('Erro ao confirmar evento', { description: message });
      }
    },
    [acknowledgeEvent]
  );

  return (
    <ProtectedRoute resource="event" action="read">
      <PageContent>
        <div className="space-y-6">
          <PageHeader title="Eventos" description="Eventos capturados pelas câmeras." />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Eventos
                </CardTitle>
                <Bell className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Novos por página
                </CardTitle>
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{newCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="space-y-2">
            <FilterBar
              placeholder="Buscar eventos..."
              sortOptions={[
                { label: 'Data', value: 'createdAt' },
                { label: 'Status', value: 'status' },
              ]}
              fields={[
                {
                  type: 'select',
                  key: 'status',
                  placeholder: 'Todos os status',
                  options: statusOptions,
                  className: 'w-[150px]',
                },
                {
                  type: 'select',
                  key: 'cameraId',
                  placeholder: 'Todas as câmeras',
                  options: cameraOptions,
                  className: 'w-[180px]',
                },
                { type: 'daterange' },
              ]}
            />
            <div className="flex justify-end">
              <ViewModeToggle defaultMode="grid" />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Erro ao carregar eventos. Tente novamente.</p>
            </div>
          )}

          <EventList
            events={events}
            isLoading={isLoading}
            variant={viewMode}
            onViewEvent={handleViewEvent}
            onAcknowledgeEvent={handleAcknowledgeEvent}
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
      </PageContent>
    </ProtectedRoute>
  );
}
