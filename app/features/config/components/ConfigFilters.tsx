import { Search, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

interface ConfigFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export function ConfigFilters({ search, onSearchChange }: ConfigFiltersProps) {
  const handleClearFilters = () => {
    onSearchChange('');
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px] max-w-sm">
        <Input
          placeholder="Buscar por chave ou descrição..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {search && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
