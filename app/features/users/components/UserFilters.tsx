import { X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import type { UserFilters as UserFiltersType } from '~/types';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: UserFiltersType) => void;
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const handleActiveOnlyChange = (checked: boolean) => {
    onFilterChange({ ...filters, activeOnly: checked || undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
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

      {filters.activeOnly && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
