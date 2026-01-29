import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuthVideo } from '~/hooks/useAuthVideo';

export interface EventVideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
  className?: string;
}

export function EventVideoPlayer({ src, poster, onEnded, className }: EventVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { videoUrl, isLoading, error } = useAuthVideo(src);

  React.useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div className={cn('relative bg-black rounded-lg overflow-hidden flex items-center justify-center', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className={cn('relative bg-black rounded-lg overflow-hidden flex items-center justify-center', className)}>
        <p className="text-white text-sm">Erro ao carregar vídeo</p>
      </div>
    );
  }

  return (
    <div className={cn('relative bg-black rounded-lg overflow-hidden', className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        poster={poster}
        onEnded={onEnded}
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
}
