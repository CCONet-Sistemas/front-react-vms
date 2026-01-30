import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/_app.cameras';
import { ProtectedRoute, PageHeader, PageContent, Pagination } from '~/components/common';
import {
  CameraFilters,
  CameraList,
  useCameras,
  type CameraFiltersType,
  type ViewMode,
} from '~/features/cameras';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Câmeras | VMS' },
    { name: 'description', content: 'Gerenciar câmeras - Video Management System' },
  ];
}

const DEFAULT_LIMIT = 12;

export default function CamerasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'list'
  );

  // Get params from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const search = searchParams.get('search') || undefined;

  // Filters state derived from URL
  const filters: CameraFiltersType = { search };

  const { data, isLoading, error } = useCameras({ page, limit, search });
  const cameras = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

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

  const handleFilterChange = (newFilters: CameraFiltersType) => {
    updateParams({
      search: newFilters.search,
      page: '1',
    });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateParams({ view: mode });
  };

  return (
    <ProtectedRoute resource="camera" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            title="Câmeras"
            description="Gerencie e configure suas câmeras"
            to="/camera"
            linkText="Adicionar"
            permission="camera:create"
          />

          {/* Filters */}
          <CameraFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />

          {/* Error state */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Erro ao carregar câmeras. Tente novamente.</p>
            </div>
          )}

          {/* Camera List */}
          <CameraList cameras={cameras} isLoading={isLoading} variant={viewMode} />

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
