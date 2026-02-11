import { Film } from 'lucide-react';
import { FlexList, FlexListEmpty } from '~/components/ui';
import type { Video } from '~/types';
import { VideoCard } from './VideoCard';

interface VideosListProps {
  videos: Video[];
  isLoading?: boolean;
  variant?: 'grid' | 'list';
  onDownload?: (video: Video) => void;
}

export function VideosList({
  videos,
  isLoading = false,
  variant = 'grid',
  onDownload,
}: VideosListProps) {
  return (
    <FlexList
      data={videos}
      isLoading={isLoading}
      keyExtractor={(video) => video.uuid}
      variant={variant}
      columns={variant === 'grid' ? 4 : 1}
      gap="md"
      emptyState={
        <FlexListEmpty
          icon={<Film className="h-6 w-6 text-muted-foreground" />}
          title="Nenhum vídeo encontrado"
          description="Não há vídeos salvos para exibir no momento."
        />
      }
      renderItem={(video) => (
        <VideoCard video={video} variant={variant} onDownload={onDownload} />
      )}
    />
  );
}
