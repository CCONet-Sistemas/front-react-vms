import { useState } from 'react';
import { Maximize2, Volume2, VolumeX, Video, Loader2 } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { Camera, StreamState } from '~/types';
import { streamStatusConfig } from '~/features/cameras/constants/streamStatus';
import { useStreamUrl } from '~/hooks/useStreamUrl';

interface CameraMosaicCellProps {
  camera?: Camera;
  onFullscreen?: (camera: Camera) => void;
  className?: string;
  showControls?: boolean;
}

export function CameraMosaicCell({
  camera,
  onFullscreen,
  className,
  showControls = true,
}: CameraMosaicCellProps) {
  const [muted, setMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const { url: streamUrl, isLoading, error } = useStreamUrl(camera?.uuid);

  if (!camera) {
    return (
      <div
        className={cn(
          'relative bg-muted flex items-center justify-center border border-border',
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Sem câmera</p>
        </div>
      </div>
    );
  }

  const streamState = camera.streamStatus
    ? (camera.streamStatus.state as StreamState)
    : 'created';
  const status = streamStatusConfig[streamState] ?? streamStatusConfig.stopped;

  return (
    <div
      className={cn('relative bg-black border border-border overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Loader2 className="h-6 w-6 text-white/60 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <p className="text-xs text-red-400 text-center px-2">Falha ao iniciar stream</p>
        </div>
      )}

      {/* Video player */}
      {streamUrl && (
        <VideoPlayer
          camera={camera}
          src={streamUrl}
          muted={muted}
          className="w-full h-full"
          enableFallback={false}
        />
      )}

      {/* Camera name overlay */}
      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs font-medium truncate">{camera.name}</span>
          {camera.streamStatus && (
            <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
              {camera.streamStatus.state}
            </Badge>
          )}
        </div>
      </div>

      {/* Controls overlay */}
      {showControls && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent',
            'flex items-center justify-end gap-1',
            'transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          {onFullscreen && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => onFullscreen(camera)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Stream info (shown on hover) */}
      {isHovered && camera.streamStatus && (
        <div className="absolute bottom-10 left-2 text-[10px] text-white/70">
          {camera.streamStatus.fps} FPS • {camera.streamStatus.resolutionWidth}x
          {camera.streamStatus.resolutionHeight}
        </div>
      )}
    </div>
  );
}
