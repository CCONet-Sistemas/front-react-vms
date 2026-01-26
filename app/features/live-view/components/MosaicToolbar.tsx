import { Grid2X2, Grid3X3, LayoutGrid, Square, Settings2, Maximize, Minimize } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export type GridSize = '1x1' | '2x2' | '3x3' | '4x4';

interface GridOption {
  value: GridSize;
  label: string;
  icon: typeof Grid2X2;
  cols: number;
  total: number;
}

export const gridOptions: GridOption[] = [
  { value: '1x1', label: '1x1', icon: Square, cols: 1, total: 1 },
  { value: '2x2', label: '2x2', icon: Grid2X2, cols: 2, total: 4 },
  { value: '3x3', label: '3x3', icon: Grid3X3, cols: 3, total: 9 },
  { value: '4x4', label: '4x4', icon: LayoutGrid, cols: 4, total: 16 },
];

interface MosaicToolbarProps {
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  onConfigClick?: () => void;
  onFullscreenClick?: () => void;
  isFullscreen?: boolean;
  className?: string;
}

export function MosaicToolbar({
  gridSize,
  onGridSizeChange,
  onConfigClick,
  onFullscreenClick,
  isFullscreen = false,
  className,
}: MosaicToolbarProps) {
  return (
    <div className={cn('flex items-center justify-between p-2 bg-surface-container rounded-lg', className)}>
      {/* Grid size selector */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">Layout:</span>
        {gridOptions.map((option) => {
          const Icon = option.icon;
          const isActive = gridSize === option.value;

          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onGridSizeChange(option.value)}
              className={cn(
                'gap-1.5',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Fullscreen button */}
        {onFullscreenClick && (
          <Button variant="outline" size="sm" onClick={onFullscreenClick}>
            {isFullscreen ? (
              <>
                <Minimize className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sair</span>
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Tela Cheia</span>
              </>
            )}
          </Button>
        )}

        {/* Config button */}
        {onConfigClick && (
          <Button variant="outline" size="sm" onClick={onConfigClick}>
            <Settings2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Configurar</span>
          </Button>
        )}
      </div>
    </div>
  );
}
