import { Camera as CameraIcon } from 'lucide-react';
import { FlexList, FlexListEmpty } from '~/components/ui';
import { CameraCard } from './CameraCard';
import type { Camera } from '~/types';

interface CameraListProps {
  cameras: Camera[];
  isLoading?: boolean;
  variant?: 'grid' | 'list';
}

export function CameraList({ cameras, isLoading = false, variant = 'grid' }: CameraListProps) {
  return (
    <FlexList
      data={cameras}
      isLoading={isLoading}
      keyExtractor={(camera) => camera.uuid}
      variant={variant}
      columns={variant === 'grid' ? 4 : 1}
      gap="md"
      emptyState={
        <FlexListEmpty
          icon={<CameraIcon className="h-6 w-6 text-muted-foreground" />}
          title="Nenhuma câmera encontrada"
          description="Adicione sua primeira câmera para começar."
        />
      }
      renderItem={(camera) => <CameraCard camera={camera} variant={variant} />}
    />
  );
}
