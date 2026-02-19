import { useCallback } from 'react';
import type { Route } from './+types/_app.saved-videos';

import { PageContent, PageHeader, Pagination, ProtectedRoute, FilterBar } from '~/components/common';
import { VideosList } from '~/features/saved-videos';
import { useVideos } from '~/features/saved-videos';
import { videoService } from '~/services/api/videoService';
import { useListParams } from '~/hooks/useListParams';
import { toast } from 'sonner';
import type { Video } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Vídeos Salvos | VMS' },
    { name: 'description', content: 'Gerenciar vídeos salvos - Video Management System' },
  ];
}

export default function SavedVideosPage() {
  const { params, setPage } = useListParams({ defaults: { per_page: 12 } });

  const { data: videoData, isLoading } = useVideos({
    page: Number(params.page),
    per_page: Number(params.per_page),
    search: params.search,
  });

  const videos = videoData?.data ?? [];
  const meta = videoData?.meta;
  const totalPages = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;

  const handleDownload = useCallback(async (video: Video) => {
    try {
      const blob = await videoService.download(video.uuid);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = video.originalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar vídeo');
    }
  }, []);

  return (
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Vídeos Salvos"
            description="Gerencie seus vídeos salvos, acesse gravações anteriores e organize seu conteúdo de vídeo."
          />

          <FilterBar
            placeholder="Buscar vídeos..."
            sortOptions={[
              { label: 'Data', value: 'createdAt' },
              { label: 'Nome', value: 'name' },
              { label: 'Tamanho', value: 'size' },
            ]}
          />

          <VideosList
            videos={videos}
            isLoading={isLoading}
            variant="grid"
            onDownload={handleDownload}
          />

          {totalPages > 0 && (
            <Pagination
              page={Number(params.page)}
              totalPages={totalPages}
              total={total}
              limit={Number(params.per_page)}
              onPageChange={setPage}
            />
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
