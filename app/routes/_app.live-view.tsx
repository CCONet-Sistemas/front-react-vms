import { useState, useEffect, useRef, useCallback } from 'react';
import type { Route } from './+types/_app.live-view';
import { Video } from 'lucide-react';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import {
  CameraFullscreenModal,
  CameraMosaic,
  CameraSelector,
  MosaicToolbar,
  gridOptions,
  type GridSize,
} from '~/features/live-view';
import { useCameras } from '~/features/cameras';
import type { Camera } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Visualização ao Vivo | VMS' },
    { name: 'description', content: 'Visualização ao vivo das câmeras - Video Management System' },
  ];
}

export default function LiveViewPage() {
  const { data, isLoading } = useCameras({ limit: 100 });
  const [gridSize, setGridSize] = useState<GridSize>('2x2');
  const [selectedCameras, setSelectedCameras] = useState<(Camera | null)[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  // Fullscreen states
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [isMosaicFullscreen, setIsMosaicFullscreen] = useState(false);
  const mosaicRef = useRef<HTMLDivElement>(null);

  const cameras = data?.data ?? [];
  const currentGridConfig = gridOptions.find((o) => o.value === gridSize);
  const maxCameras = currentGridConfig?.total ?? 4;

  // Auto-fill cameras when data loads or grid size changes
  useEffect(() => {
    if (cameras.length > 0 && selectedCameras.filter(Boolean).length === 0) {
      // Auto-fill with first N cameras
      const initialCameras: (Camera | null)[] = Array.from({ length: maxCameras }, (_, i) =>
        cameras[i] ?? null
      );
      setSelectedCameras(initialCameras);
    }
  }, [cameras, maxCameras]);

  // Adjust selected cameras when grid size changes
  useEffect(() => {
    setSelectedCameras((prev) => {
      if (prev.length < maxCameras) {
        // Add empty slots
        return [...prev, ...Array(maxCameras - prev.length).fill(null)];
      } else if (prev.length > maxCameras) {
        // Trim excess
        return prev.slice(0, maxCameras);
      }
      return prev;
    });
  }, [maxCameras]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMosaicFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Single camera fullscreen
  const handleCameraFullscreen = (camera: Camera) => {
    setFullscreenCamera(camera);
  };

  const handleCloseCameraFullscreen = () => {
    setFullscreenCamera(null);
  };

  // Navigate through cameras in fullscreen modal
  const activeCameras = selectedCameras.filter((c): c is Camera => c !== null);
  const currentCameraIndex = fullscreenCamera
    ? activeCameras.findIndex((c) => c.uuid === fullscreenCamera.uuid)
    : -1;

  const handlePreviousCamera = useCallback(() => {
    if (currentCameraIndex > 0) {
      setFullscreenCamera(activeCameras[currentCameraIndex - 1]);
    }
  }, [currentCameraIndex, activeCameras]);

  const handleNextCamera = useCallback(() => {
    if (currentCameraIndex < activeCameras.length - 1) {
      setFullscreenCamera(activeCameras[currentCameraIndex + 1]);
    }
  }, [currentCameraIndex, activeCameras]);

  // Mosaic fullscreen toggle
  const handleMosaicFullscreen = async () => {
    if (!mosaicRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await mosaicRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleGridSizeChange = (size: GridSize) => {
    setGridSize(size);
  };

  const handleSelectionChange = (newSelection: (Camera | null)[]) => {
    setSelectedCameras(newSelection);
  };

  const selectedCount = selectedCameras.filter(Boolean).length;

  return (
    <ProtectedRoute resource="stream" action="read">
      <PageContent variant="list" className="flex flex-col h-[calc(100vh-4rem)]">
        <PageHeader
          title="Visualização ao Vivo"
          description={`${selectedCount} de ${maxCameras} câmeras no mosaico`}
        />

        {/* Toolbar */}
        <MosaicToolbar
          gridSize={gridSize}
          onGridSizeChange={handleGridSizeChange}
          onConfigClick={() => setShowSelector(true)}
          onFullscreenClick={handleMosaicFullscreen}
          isFullscreen={isMosaicFullscreen}
          className="mb-4"
        />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando câmeras...</div>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma câmera disponível</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione câmeras para visualizar os feeds ao vivo
            </p>
          </div>
        ) : (
          <CameraMosaic
            ref={mosaicRef}
            selectedCameras={selectedCameras}
            gridSize={gridSize}
            onCameraFullscreen={handleCameraFullscreen}
            className="flex-1"
          />
        )}

        {/* Camera Selector Modal */}
        <CameraSelector
          cameras={cameras}
          selectedCameras={selectedCameras}
          onSelectionChange={handleSelectionChange}
          maxCameras={maxCameras}
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
        />

        {/* Single Camera Fullscreen Modal */}
        <CameraFullscreenModal
          camera={fullscreenCamera}
          isOpen={!!fullscreenCamera}
          onClose={handleCloseCameraFullscreen}
          onPrevious={currentCameraIndex > 0 ? handlePreviousCamera : undefined}
          onNext={currentCameraIndex < activeCameras.length - 1 ? handleNextCamera : undefined}
          showNavigation={activeCameras.length > 1}
        />
      </PageContent>
    </ProtectedRoute>
  );
}
