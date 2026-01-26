import { useState, forwardRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CameraMosaicCell } from './CameraMosaicCell';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { Camera } from '~/types';
import type { GridSize } from './MosaicToolbar';

interface CameraMosaicProps {
  /** Selected cameras for each slot (can have nulls for empty slots) */
  selectedCameras: (Camera | null)[];
  /** Grid size (1x1, 2x2, 3x3, 4x4) */
  gridSize: GridSize;
  /** Callback when fullscreen is requested */
  onCameraFullscreen?: (camera: Camera) => void;
  /** Additional class names */
  className?: string;
}

const gridConfig = {
  '1x1': { cols: 1, rows: 1, total: 1 },
  '2x2': { cols: 2, rows: 2, total: 4 },
  '3x3': { cols: 3, rows: 3, total: 9 },
  '4x4': { cols: 4, rows: 4, total: 16 },
};

export const CameraMosaic = forwardRef<HTMLDivElement, CameraMosaicProps>(
  function CameraMosaic({ selectedCameras, gridSize, onCameraFullscreen, className }, ref) {
    const [mobileIndex, setMobileIndex] = useState(0);
    const config = gridConfig[gridSize];

    // Get cameras for current grid (fill with nulls if needed)
    const gridCameras = Array.from({ length: config.total }, (_, i) => selectedCameras[i] ?? null);

    // For mobile, filter only non-null cameras
    const mobileCameras = selectedCameras.filter((c): c is Camera => c !== null);

    const handleMobilePrev = () => {
      setMobileIndex((prev) => Math.max(0, prev - 1));
    };

    const handleMobileNext = () => {
      setMobileIndex((prev) => Math.min(mobileCameras.length - 1, prev + 1));
    };

    // Dynamic grid classes
    const gridClasses = {
      '1x1': 'grid-cols-1 grid-rows-1',
      '2x2': 'grid-cols-2 grid-rows-2',
      '3x3': 'grid-cols-3 grid-rows-3',
      '4x4': 'grid-cols-4 grid-rows-4',
    };

    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)}>
        {/* Desktop/Tablet: Dynamic Grid */}
        <div className={cn('hidden md:grid gap-1 flex-1', gridClasses[gridSize])}>
          {gridCameras.map((camera, index) => (
            <CameraMosaicCell
              key={camera?.uuid || `empty-${index}`}
              camera={camera ?? undefined}
              onFullscreen={onCameraFullscreen}
            />
          ))}
        </div>

        {/* Mobile: 1x1 with navigation */}
        <div className="md:hidden flex flex-col h-full">
          <div className="flex-1 relative">
            {mobileCameras.length > 0 ? (
              <CameraMosaicCell
                camera={mobileCameras[mobileIndex]}
                onFullscreen={onCameraFullscreen}
                className="absolute inset-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Nenhuma câmera selecionada</p>
              </div>
            )}
          </div>

          {/* Mobile navigation */}
          {mobileCameras.length > 1 && (
            <div className="flex items-center justify-between p-2 bg-surface-container">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMobilePrev}
                disabled={mobileIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                {mobileIndex + 1} / {mobileCameras.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleMobileNext}
                disabled={mobileIndex === mobileCameras.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
