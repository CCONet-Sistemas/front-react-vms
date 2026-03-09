import { Camera as CameraIcon, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { FlexList, FlexListEmpty } from '~/components/ui';
import { Button } from '~/components/ui/button';
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
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/camera">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar câmera
              </Link>
            </Button>
          }
        />
      }
      renderItem={(camera) => <CameraCard camera={camera} variant={variant} />}
    />
  );
}
