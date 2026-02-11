import type { Route } from './+types/_app.saved-videos';

import { PageContent, PageHeader, Pagination, ProtectedRoute } from '~/components/common';
import { VideosList } from '~/features/saved-videos';
import { useVideos } from '~/features/saved-videos';
import { videoService } from '~/services/api/videoService';
import { useSearchParams } from 'react-router';
import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Video } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Vídeos Salvos | VMS' },
    { name: 'description', content: 'Gerenciar vídeos salvos - Video Management System' },
  ];
}

const DEFAULT_PER_PAGE = 12;

export default function SavedVideosPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('per_page')) || DEFAULT_PER_PAGE;

  const { data: videoData, isLoading } = useVideos({ page, per_page: perPage });

  const videos = videoData?.data ?? [];
  const meta = videoData?.meta;
  const totalPages = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ per_page: String(newLimit), page: '1' });
  };

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

          <VideosList
            videos={videos}
            isLoading={isLoading}
            variant="grid"
            onDownload={handleDownload}
          />

          {totalPages > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={perPage}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
