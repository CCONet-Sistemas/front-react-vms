import { Link } from 'react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { Video, VideoOff, AlertCircle, Pause } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { useTheme, useAuthImage } from '~/hooks';
import type { Camera, StreamState } from '~/types';
import placeholderLight from '~/assets/images/placeholder-camera.png';
import placeholderDark from '~/assets/images/placeholder-camera-darkmode.png';

const recordingCardVariants = cva(
  'group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md',
  {
    variants: {
      variant: {
        grid: 'flex flex-col overflow-hidden',
        list: 'flex flex-row items-stretch overflow-hidden',
      },
    },
    defaultVariants: {
      variant: 'grid',
    },
  }
);

const thumbnailVariants = cva('relative bg-muted overflow-hidden', {
  variants: {
    variant: {
      grid: 'aspect-video w-full',
      list: 'w-32 sm:w-40 shrink-0',
    },
  },
  defaultVariants: {
    variant: 'grid',
  },
});

export interface RecordingCardProps extends VariantProps<typeof recordingCardVariants> {
  recording: Camera;
  className?: string;
}

// export type StreamState = 'created' | 'starting' | 'streaming' | 'degraded' | 'retrying' | 'paused' | 'offline' | 'stopped';
//
const statusConfig: Record<
  StreamState,
  {
    label: string;
    variant: 'success' | 'secondary' | 'destructive' | 'warning';
    status: StreamState;
    icon: typeof Video;
  }
> = {
  created: { label: 'Criado', variant: 'secondary', status: 'created', icon: Video },
  starting: { label: 'Iniciando', variant: 'warning', status: 'starting', icon: Pause },
  streaming: { label: 'Transmitindo', variant: 'success', status: 'streaming', icon: Video },
  degraded: { label: 'Degradado', variant: 'warning', status: 'degraded', icon: AlertCircle },
  retrying: {
    label: 'Tentando Reconectar',
    variant: 'warning',
    status: 'retrying',
    icon: AlertCircle,
  },
  paused: { label: 'Pausado', variant: 'secondary', status: 'paused', icon: Pause },
  offline: { label: 'Offline', variant: 'destructive', status: 'offline', icon: AlertCircle },
  stopped: { label: 'Parado', variant: 'secondary', status: 'stopped', icon: VideoOff },
};

export function RecordingCard({ recording, variant = 'grid', className }: RecordingCardProps) {
  const { isDark } = useTheme();

  const streamState = recording.streamStatus
    ? (recording.streamStatus.state as StreamState)
    : 'created';
  const status = statusConfig[streamState] ?? statusConfig.stopped;
  const StatusIcon = status.icon;

  const snapshotUrl = recording.video?.snapshot?.enabled
    ? `/camera/${recording.uuid}/snapshot/image`
    : null;

  const { imageUrl } = useAuthImage(snapshotUrl, {
    enabled: !!snapshotUrl,
  });

  const placeholder = isDark ? placeholderDark : placeholderLight;
  const imageSrc = imageUrl || placeholder;

  return (
    <Link to={`/recording/${recording.uuid}`}>
      <div className={cn(recordingCardVariants({ variant }), className)}>
        {/* Thumbnail */}
        <div className={cn(thumbnailVariants({ variant }))}>
          <img
            src={imageSrc}
            alt={recording.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          {/* Status badge overlay */}
          <div className="absolute top-2 right-2">
            <Badge variant={status.variant} className="gap-1 text-xs">
              <StatusIcon className="h-3 w-3" />
              {variant === 'grid' && <span className="hidden sm:inline">{status.label}</span>}
              {variant === 'list' && status.label}
            </Badge>
          </div>

          {/* Resolution badge - only on grid */}
          {variant === 'grid' && recording.video?.width && recording.video?.height && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-black/50 text-white border-none text-xs">
                {recording.video.width}x{recording.video.height}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            'flex flex-col',
            variant === 'grid' ? 'p-3 flex-1' : 'p-3 sm:p-4 flex-1 justify-center'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-medium text-foreground truncate',
                  variant === 'grid' ? 'text-sm' : 'text-sm sm:text-base'
                )}
              >
                {recording.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {recording.connection?.host}:{recording.connection?.port}
              </p>
            </div>
          </div>

          {/* Extra info for list view */}
          {variant === 'list' && recording.video?.width && recording.video?.height && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>
                {recording.video.width}x{recording.video.height}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export { recordingCardVariants };
