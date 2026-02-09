import { Camera as CameraIcon } from 'lucide-react';
import { FlexList, FlexListEmpty } from '~/components/ui';
import type { Camera } from '~/types';
import { RecordingCard } from './RecordingCard';

interface RecordingListProps {
  recordings: Camera[];
  isLoading?: boolean;
  variant?: 'grid' | 'list';
}

export function RecordingList({
  recordings,
  isLoading = false,
  variant = 'grid',
}: RecordingListProps) {
  return (
    <FlexList
      data={recordings}
      isLoading={isLoading}
      keyExtractor={(recording) => recording.uuid}
      variant={variant}
      columns={variant === 'grid' ? 4 : 1}
      gap="md"
      emptyState={
        <FlexListEmpty
          icon={<CameraIcon className="h-6 w-6 text-muted-foreground" />}
          title="Nenhuma gravação encontrada"
          description="Listagem de camera com gravações disponiveis."
        />
      }
      renderItem={(recording) => <RecordingCard recording={recording} variant={variant} />}
    />
  );
}
