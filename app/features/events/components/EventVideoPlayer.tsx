import * as React from 'react';
import { Loader2, Play } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuthVideo } from '~/hooks/useAuthVideo';
import { useAuthImage } from '~/hooks';

export interface EventVideoPlayerProps {
  src: string;
  thumbnailUrl?: string;
  onEnded?: () => void;
  className?: string;
}

export function EventVideoPlayer({ src, thumbnailUrl, onEnded, className }: EventVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);

  const { imageUrl: thumbnail, isLoading: isLoadingThumbnail } = useAuthImage(thumbnailUrl ?? '');
  const { videoUrl, isLoading: isLoadingVideo, error } = useAuthVideo(shouldLoadVideo ? src : '');

  React.useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [videoUrl]);

  // Reset quando mudar o src (trocar de vídeo)
  React.useEffect(() => {
    setShouldLoadVideo(false);
  }, [src]);

  const handlePlayClick = () => {
    setShouldLoadVideo(true);
  };

  // Estado inicial: mostra thumbnail com botão de play
  if (!shouldLoadVideo) {
    return (
      <div
        className={cn('relative bg-black rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group', className)}
        onClick={handlePlayClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlayClick();
          }
        }}
      >
        {isLoadingThumbnail ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : thumbnail ? (
          <img
            src={thumbnail}
            alt="Thumbnail do vídeo"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}

        {/* Overlay com botão de play */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all shadow-lg">
            <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  // Carregando vídeo
  if (isLoadingVideo) {
    return (
      <div className={cn('relative bg-black rounded-lg overflow-hidden flex items-center justify-center', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Erro ao carregar
  if (error || !videoUrl) {
    return (
      <div className={cn('relative bg-black rounded-lg overflow-hidden flex items-center justify-center', className)}>
        <p className="text-white text-sm">Erro ao carregar vídeo</p>
      </div>
    );
  }

  // Player de vídeo
  return (
    <div className={cn('relative bg-black rounded-lg overflow-hidden', className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        onEnded={onEnded}
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
}
