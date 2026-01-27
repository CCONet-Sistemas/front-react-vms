import { Search, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import type { UserFilters as UserFiltersType } from '~/types';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: UserFiltersType) => void;
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined });
  };

  const handleActiveOnlyChange = (checked: boolean) => {
    onFilterChange({ ...filters, activeOnly: checked || undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.search || filters.activeOnly;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px] max-w-sm">
        <Input
          placeholder="Buscar por nome ou email..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="activeOnly"
          checked={filters.activeOnly || false}
          onChange={(e) => handleActiveOnlyChange(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <Label htmlFor="activeOnly" className="text-sm font-normal cursor-pointer">
          Apenas ativos
        </Label>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
