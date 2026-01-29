import { Search, X, Grid, List } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Select, SelectOption } from '~/components/ui/select';
import { statusOptions } from '../constants/eventTypes';
import type { EventFilters as EventFiltersType } from '~/types';

export type ViewMode = 'grid' | 'list';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFilterChange: (filters: EventFiltersType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function EventFilters({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: EventFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value ? (value as EventFiltersType['status']) : undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Buscar eventos..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Status filter */}
        <div className="w-[150px]">
          <Select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <SelectOption value="">Todos os status</SelectOption>
            {statusOptions.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}

        {/* View mode toggle */}
        <div className="flex items-center gap-1 ml-auto border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewModeChange('grid')}
            aria-label="Visualização em grade"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewModeChange('list')}
            aria-label="Visualização em lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
