import { useState, useCallback } from 'react';
import { redirect, useNavigate, useSearchParams } from 'react-router';
import type { Route } from './+types/_app.events';
import { toast } from 'sonner';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '~/components/ui';
import { PageContent, PageHeader, Pagination, ProtectedRoute } from '~/components/common';
import {
  EventFilters,
  EventList,
  useEvents,
  useAcknowledgeEvent,
  type ViewMode,
} from '~/features/events';
import type { Event, EventFilters as EventFiltersType } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Eventos | VMS' },
    { name: 'description', content: 'Visualizar eventos - Video Management System' },
  ];
}

const DEFAULT_LIMIT = 12;

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'grid'
  );

  // Get params from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as EventFiltersType['status']) || undefined;
  const cameraId = searchParams.get('cameraId') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  // Filters state derived from URL
  const filters: EventFiltersType = { search, status, cameraId, startDate, endDate };

  // Queries and mutations
  const { data, isLoading, error } = useEvents({ page, limit, ...filters });
  const acknowledgeEvent = useAcknowledgeEvent();
  const navigate = useNavigate();
  const events = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Calculate stats
  const newCount = events.filter((e) => e.status === 'new').length;

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ limit: String(newLimit), page: '1' });
  };

  const handleFilterChange = (newFilters: EventFiltersType) => {
    updateParams({
      search: newFilters.search,
      status: newFilters.status,
      cameraId: newFilters.cameraId,
      startDate: newFilters.startDate,
      endDate: newFilters.endDate,
      page: '1', // Reset to first page when filters change
    });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateParams({ view: mode });
  };

  const handleViewEvent = (event: Event) => {
    navigate(`/event/${event.uuid}`);
  };

  const handleAcknowledgeEvent = async (event: Event) => {
    try {
      await acknowledgeEvent.mutateAsync(event.uuid);
      toast.success('Evento confirmado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro';
      toast.error('Erro ao confirmar evento', { description: message });
    }
  };

  return (
    <ProtectedRoute resource="event" action="read">
      <PageContent>
        <div className="space-y-6">
          {/* Header */}
          <PageHeader title="Eventos" description="Eventos capturados pelas câmeras." />

          {/* Stats Cards */}
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

          {/* Filters */}
          <EventFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />

          {/* Error state */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Erro ao carregar eventos. Tente novamente.</p>
            </div>
          )}

          {/* Events List */}
          <EventList
            events={events}
            isLoading={isLoading}
            variant={viewMode}
            onViewEvent={handleViewEvent}
            onAcknowledgeEvent={handleAcknowledgeEvent}
          />

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
