import * as React from 'react';
import { Camera, Calendar, Shield, Tag, Check, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { apiClient } from '~/services/api';
import { EventVideoPlayer } from './EventVideoPlayer';
import { EventVideoList } from './EventVideoList';
import { statusConfig } from '../constants/eventTypes';
import type { Event, EventVideo } from '~/types';
import { Button } from '~/components/ui/button';

export interface EventDetailProps {
  event: Event;
  onAcknowledge?: (event: Event) => void;
  isAcknowledging?: boolean;
}

function buildVideoStreamUrl(videoUuid: string): string {
  return `/events/videos/${videoUuid}/stream`;
}

function buildVideoDownloadUrl(videoUuid: string): string {
  return `/events/videos/${videoUuid}/download`;
}

function buildVideoThumbnailUrl(videoUuid: string): string {
  return `/events/videos/${videoUuid}/thumbnail`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function EventDetail({ event, onAcknowledge, isAcknowledging }: EventDetailProps) {
  const readyVideos = event.videos.filter((v) => v.status === 'ready');
  const [selectedVideo, setSelectedVideo] = React.useState<EventVideo | null>(
    readyVideos[0] ?? null
  );

  const status = statusConfig[event.status];
  const StatusIcon = status.icon;

  const handleDownload = async (video: EventVideo) => {
    try {
      const response = await apiClient.get(buildVideoDownloadUrl(video.uuid), {
        responseType: 'blob',
      });
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = video.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao fazer download do vídeo:', error);
    }
  };

  const handleVideoEnded = () => {
    if (!selectedVideo) return;
    const currentIndex = readyVideos.findIndex((v) => v.uuid === selectedVideo.uuid);
    const nextVideo = readyVideos[currentIndex + 1];
    if (nextVideo) {
      setSelectedVideo(nextVideo);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main content: Video Player + Video List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player - takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              {selectedVideo ? (
                <EventVideoPlayer
                  src={buildVideoStreamUrl(selectedVideo.uuid)}
                  thumbnailUrl={buildVideoThumbnailUrl(event.uuid)}
                  onEnded={handleVideoEnded}
                  className="aspect-video"
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhum vídeo disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Video List - takes 1/3 on desktop */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <EventVideoList
                videos={event.videos}
                selectedVideo={selectedVideo}
                onSelectVideo={setSelectedVideo}
                onDownload={handleDownload}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Câmera</p>
                <p className="text-sm font-medium">{event.cameraName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={status.badgeVariant} className="gap-1 mt-0.5">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confiança</p>
                <p className="text-sm font-medium">{event.confidence}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm font-medium">{formatDate(event.timestamp)}</p>
              </div>
            </div>
            {onAcknowledge && event.status !== 'acknowledged' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <X className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Button
                    variant="warning"
                    onClick={() => onAcknowledge(event)}
                    disabled={isAcknowledging}
                  >
                    {isAcknowledging ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>Confirmar</>
                    )}
                  </Button>
                </div>
              </div>
            )}
            {event.status === 'acknowledged' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-success/10">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-success">Confirmado</p>
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Motivo</p>
            <p className="text-sm">{event.reason}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
