import { Link } from 'react-router';
import { Video, VideoOff, AlertCircle, Pause } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { useTheme, useAuthImage } from '~/hooks';
import type { Camera, CameraStatus, StreamState } from '~/types';
import placeholderLight from '~/assets/images/placeholder-camera.png';
import placeholderDark from '~/assets/images/placeholder-camera-darkmode.png';
interface CameraCardProps {
  camera: Camera;
  className?: string;
}

// export type StreamState = 'created' | 'starting' | 'streaming' | 'degraded' | 'retrying' | 'paused' | 'offline' | 'stopped';
//
const statusConfig: Record<
  StreamState,
  { label: string; variant: 'success' | 'secondary' | 'destructive' | 'warning'; status: StreamState, icon: typeof Video }
> = {
  created: { label: 'Criado', variant: 'secondary', status: 'created', icon: Video },
  starting: { label: 'Iniciando', variant: 'warning', status: 'starting', icon: Pause },
  streaming: { label: 'Transmitindo', variant: 'success', status: 'streaming', icon: Video },
  degraded: { label: 'Degradado', variant: 'warning', status: 'degraded', icon: AlertCircle },
  retrying: { label: 'Tentando Reconectar', variant: 'warning', status: 'retrying', icon: AlertCircle },
  paused: { label: 'Pausado', variant: 'secondary', status: 'paused', icon: Pause },
  offline: { label: 'Offline', variant: 'destructive', status: 'offline', icon: AlertCircle },
  stopped: { label: 'Parado', variant: 'secondary', status: 'stopped', icon: VideoOff },

};

export function CameraCard({ camera, className }: CameraCardProps) {
  const { isDark } = useTheme();
  const streamState = camera.streamStatus.state as StreamState;
  const status = statusConfig[streamState] ?? statusConfig.stopped;
  const StatusIcon = status.icon;

  const snapshotUrl = camera.video?.snapshot?.enabled
    ? `/camera/${camera.uuid}/snapshot/image`
    : null;

  // Fetch imagem com autenticação
  const { imageUrl } = useAuthImage(snapshotUrl, {
    enabled: !!snapshotUrl,
  });

  const placeholder = isDark ? placeholderDark : placeholderLight;
  const imageSrc = imageUrl || placeholder;

  return (
    <Link to={`/camera/${camera.uuid}`}>
      <Card
        className={cn(
          'overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer',
          className
        )}
      >
        {/* Preview area */}
        <div className="relative aspect-video bg-muted">
          <img
            src={imageSrc}
            alt={camera.name}
            className="w-full h-full object-cover"
            loading="lazy"
            // onError={() => setImgError(true)}
          />

          {/* Status badge overlay */}
          <div className="absolute top-2 right-2">
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          {/* Resolution badge */}
          {camera.video?.width && camera.video?.height && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-black/50 text-white border-none text-xs">
                {camera.video.width}x{camera.video.height}
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{camera.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {camera.connection?.host}:{camera.connection?.port}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
