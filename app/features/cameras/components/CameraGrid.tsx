import { Camera as CameraIcon } from 'lucide-react';
import { CameraCard } from './CameraCard';
import type { Camera } from '~/types';

interface CameraGridProps {
  cameras: Camera[];
  isLoading?: boolean;
}

function CameraGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CameraGridEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CameraIcon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Nenhuma câmera encontrada</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Adicione sua primeira câmera para começar
      </p>
    </div>
  );
}

export function CameraGrid({ cameras, isLoading }: CameraGridProps) {
  if (isLoading) {
    return <CameraGridSkeleton />;
  }

  if (!cameras || cameras.length === 0) {
    return <CameraGridEmpty />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cameras.map((camera) => (
        <CameraCard key={camera.uuid} camera={camera} />
      ))}
    </div>
  );
}
