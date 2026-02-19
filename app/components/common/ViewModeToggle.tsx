import { useSearchParams } from 'react-router';
import { Grid, List } from 'lucide-react';
import { Button } from '~/components/ui/button';

export type ViewMode = 'grid' | 'list';

interface ViewModeToggleProps {
  defaultMode?: ViewMode;
}

export function ViewModeToggle({ defaultMode = 'grid' }: ViewModeToggleProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = (searchParams.get('view') as ViewMode) ?? defaultMode;

  const set = (mode: ViewMode) => {
    const np = new URLSearchParams(searchParams);
    np.set('view', mode);
    setSearchParams(np);
  };

  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={current === 'grid' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => set('grid')}
        aria-label="Visualização em grade"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={current === 'list' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => set('list')}
        aria-label="Visualização em lista"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
