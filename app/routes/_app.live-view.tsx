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

const STORAGE_KEY = 'vms-live-view-config';

interface LiveViewConfig {
  gridSize: GridSize;
  selectedCameras: (Pick<Camera, 'uuid' | 'name'> | null)[];
}

function loadConfig(): LiveViewConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load live view config:', e);
  }
  return null;
}

function saveConfig(config: LiveViewConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save live view config:', e);
  }
}

export default function LiveViewPage() {
  const { data, isLoading } = useCameras({ per_page: 100 });
  const [isInitialized, setIsInitialized] = useState(false);
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

  // Initialize from localStorage when cameras load
  useEffect(() => {
    if (cameras.length === 0 || isInitialized) return;

    const config = loadConfig();

    // Restore grid size first
    const savedGridSize = config?.gridSize ?? '2x2';
    setGridSize(savedGridSize);

    // Get maxCameras for the restored grid size
    const restoredGridConfig = gridOptions.find((o) => o.value === savedGridSize);
    const restoredMaxCameras = restoredGridConfig?.total ?? 4;

    // Create a map for faster lookup - to get full camera data if available
    const cameraMap = new Map(cameras.map((c) => [c.uuid, c]));

    if (config?.selectedCameras && config.selectedCameras.some((cam) => cam !== null)) {
      // Restore saved cameras - use full data if available, otherwise use saved minimal data
      const restoredCameras: (Camera | null)[] = config.selectedCameras.map((saved) => {
        if (!saved) return null;
        // Try to get full camera data, fallback to saved minimal data
        return cameraMap.get(saved.uuid) ?? (saved as Camera);
      });

      // Adjust to maxCameras
      const adjusted = restoredCameras.slice(0, restoredMaxCameras);
      while (adjusted.length < restoredMaxCameras) {
        adjusted.push(null);
      }
      setSelectedCameras(adjusted);
    } else {
      // Auto-fill with first N cameras
      const initialCameras: (Camera | null)[] = Array.from(
        { length: restoredMaxCameras },
        (_, i) => cameras[i] ?? null
      );
      setSelectedCameras(initialCameras);
    }
    setIsInitialized(true);
  }, [cameras, isInitialized]);

  // Adjust selected cameras when grid size changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    setSelectedCameras((prev) => {
      if (prev.length < maxCameras) {
        return [...prev, ...Array(maxCameras - prev.length).fill(null)];
      } else if (prev.length > maxCameras) {
        return prev.slice(0, maxCameras);
      }
      return prev;
    });
  }, [maxCameras, isInitialized]);

  // Save config to localStorage when it changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    saveConfig({
      gridSize,
      selectedCameras: selectedCameras.map((c) =>
        c ? { uuid: c.uuid, name: c.name } : null
      ),
    });
  }, [gridSize, selectedCameras, isInitialized]);

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
          selectedCameras={selectedCameras}
          onSelectionChange={handleSelectionChange}
          maxCameras={maxCameras}
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
          initialCameras={cameras}
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
