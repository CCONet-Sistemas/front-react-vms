import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { X, Grid, List } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Select, SelectOption } from '~/components/ui/select';
import { DateRangePicker } from '~/components/ui/date-picker';
import { statusOptions } from '../constants/eventTypes';
import { useCameras } from '~/features/cameras';
import { cn } from '~/lib/utils';
import type { EventFilters as EventFiltersType } from '~/types';

export type ViewMode = 'grid' | 'list';

interface EventFiltersProps {
  showStatus?: boolean;
  showCamera?: boolean;
  showDateRange?: boolean;
  showViewMode?: boolean;
  className?: string;
}

export function EventFilters({
  showStatus = true,
  showCamera = true,
  showDateRange = true,
  showViewMode = true,
  className,
}: EventFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || '';
  const cameraId = searchParams.get('cameraId') || '';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';

  const { data: camerasData } = useCameras({ limit: 100 });
  const cameras = camerasData?.data ?? [];

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') newParams.delete(key);
        else newParams.set(key, value);
      });
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('view', mode);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    updateParams({
      status: undefined,
      cameraId: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  }, [updateParams]);

  const hasActiveFilters = !!(status || cameraId || startDate || endDate);

  const anyFilterVisible = showStatus || showCamera || showDateRange;

  if (!anyFilterVisible && !showViewMode) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {showStatus && (
        <Select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value || undefined })}
          className="w-[150px]"
        >
          <SelectOption value="">Todos os status</SelectOption>
          {statusOptions.map((opt) => (
            <SelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </SelectOption>
          ))}
        </Select>
      )}

      {showCamera && (
        <Select
          value={cameraId}
          onChange={(e) => updateParams({ cameraId: e.target.value || undefined })}
          className="w-[180px]"
        >
          <SelectOption value="">Todas as câmeras</SelectOption>
          {cameras.map((camera) => (
            <SelectOption key={camera.uuid} value={camera.uuid}>
              {camera.name}
            </SelectOption>
          ))}
        </Select>
      )}

      {showDateRange && (
        <DateRangePicker
          value={{ startDate, endDate }}
          onChange={(range) =>
            updateParams({ startDate: range.startDate, endDate: range.endDate })
          }
        />
      )}

      {hasActiveFilters && anyFilterVisible && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}

      {showViewMode && (
        <div className="flex items-center gap-1 ml-auto border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => handleViewModeChange('grid')}
            aria-label="Visualização em grade"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => handleViewModeChange('list')}
            aria-label="Visualização em lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
