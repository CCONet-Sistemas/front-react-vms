import type { Route } from './+types/_app.recordings';

import { PageContent, PageHeader, Pagination, ProtectedRoute } from '~/components/common';
import { RecordingList } from '~/features/recordings/components/RecordingList';
import { useAvailableRange } from '~/features/recordings/hooks/useRecording';
import { CameraFilters, useCameras, type CameraFiltersType } from '~/features/cameras';
import { useSearchParams } from 'react-router';
import type { ViewMode } from '~/features/events';
import { useCallback, useState } from 'react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Recordings | VMS' },
    { name: 'description', content: 'View recordings - Video Management System' },
  ];
}

const DEFAULT_LIMIT = 12;

export default function RecordingsPage() {
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

  const {
    data: cameraData,
    isLoading: cameraLoading,
    error: cameraError,
  } = useCameras({ page, limit, search }); // Replace with actual camera ID or parameter

  const data = cameraData?.data ?? [];
  const total = cameraData?.total ?? 0;
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
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Listagem de Gravações"
            description="Gravações de vídeo armazenadas no sistema"
          />
          {/* Filters */}
          <CameraFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          <RecordingList recordings={data} isLoading={cameraLoading} variant="list" />
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
