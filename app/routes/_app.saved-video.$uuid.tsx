import type { Route } from '../+types/root';

import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { useVideo } from '~/features/saved-videos';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Download, Film, Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Player de Vídeo | VMS' },
    { name: 'description', content: 'Assistir vídeo salvo - Video Management System' },
  ];
}

function formatFileSize(sizeStr: string): string {
  const bytes = Number(sizeStr);
  if (isNaN(bytes) || bytes === 0) return sizeStr;
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SavedVideoPlayerPage({ params }: Route.ComponentProps) {
  const { uuid } = params;

  const { data: video, isLoading } = useVideo(uuid ?? '');

  const handleDownload = useCallback(async () => {
    if (!video) return;
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = video.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar vídeo');
    }
  }, [video]);

  if (!uuid) {
    return (
      <ProtectedRoute resource="recording" action="read">
        <PageContent variant="form">
          <PageHeader
            title="Vídeo não encontrado"
            description="O vídeo solicitado não foi encontrado."
          />
        </PageContent>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="form">
        <PageHeader title="Player de Vídeo" description="Assistir vídeo salvo" />

        <div className="mx-auto w-full max-w-5xl space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : video ? (
            <>
              {/* Video Player */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="aspect-video bg-black">
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full"
                  >
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                </div>
              </div>

              {/* Video Info */}
              <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {video.fileName}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Criado em {formatDate(video.createdAt)}
                    </p>
                  </div>
                  <Button onClick={handleDownload} className="gap-2 shrink-0">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{formatFileSize(video.size)}</Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Vídeo não encontrado</h3>
              <p className="text-sm text-muted-foreground">
                O vídeo solicitado não existe ou foi removido.
              </p>
            </div>
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
