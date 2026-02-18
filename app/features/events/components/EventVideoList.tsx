import { Download, Play, Loader2, AlertCircle, Video } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import type { EventVideo } from '~/types';

export interface EventVideoListProps {
  videos: EventVideo[];
  selectedVideo: EventVideo | null;
  onSelectVideo: (video: EventVideo) => void;
  onDownload: (video: EventVideo) => void;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function VideoStatusBadge({ status }: { status: EventVideo['status'] }) {
  const config = {
    ready: { label: 'Pronto', variant: 'success' as const, icon: null },
    processing: { label: 'Processando', variant: 'secondary' as const, icon: Loader2 },
    error: { label: 'Erro', variant: 'destructive' as const, icon: AlertCircle },
    pending: { label: 'Pendente', variant: 'warning' as const, icon: null },
    failed: { label: 'Falhou', variant: 'destructive' as const, icon: AlertCircle },
  };
  console.log('Video status:', status);
  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="text-xs gap-1">
      {Icon && <Icon className="h-3 w-3 animate-spin" />}
      {label}
    </Badge>
  );
}

export function EventVideoList({
  videos,
  selectedVideo,
  onSelectVideo,
  onDownload,
}: EventVideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
        <Video className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">Nenhum vídeo disponível</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-medium text-sm text-muted-foreground px-1">Vídeos ({videos.length})</h3>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {videos.map((video, index) => {
          const isSelected = selectedVideo?.uuid === video.uuid;
          const isReady = video.status === 'ready';

          return (
            <div
              key={video.uuid}
              className={cn(
                'flex flex-col gap-2 p-3 mr-2 rounded-lg border transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50',
                isReady && 'cursor-pointer'
              )}
              onClick={() => isReady && onSelectVideo(video)}
              role={isReady ? 'button' : undefined}
              tabIndex={isReady ? 0 : undefined}
              onKeyDown={(e) => {
                if (isReady && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectVideo(video);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full shrink-0',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {isSelected ? (
                      <Play className="h-4 w-4 fill-current" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{video.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{video.size}</span>
                      <span>•</span>
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  </div>
                </div>
                <VideoStatusBadge status={video.status} />
              </div>

              {isReady && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(video);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
