import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuthStore } from '~/store/auth.store';

export interface HLSPlayerHandle {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  setVolume(v: number): void;
  setMuted(m: boolean): void;
  setPlaybackRate(rate: number): void;
}

interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onPlaying?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const HLSPlayer = forwardRef<HLSPlayerHandle, HLSPlayerProps>(function HLSPlayer({
  src,
  autoPlay = true,
  muted = true,
  controls = false,
  className,
  onError,
  onPlaying,
  onPause,
  onEnded,
}, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');

  useImperativeHandle(ref, () => ({
    play() { videoRef.current?.play(); },
    pause() { videoRef.current?.pause(); },
    seek(seconds: number) { if (videoRef.current) videoRef.current.currentTime = seconds; },
    setVolume(v: number) { if (videoRef.current) videoRef.current.volume = v; },
    setMuted(m: boolean) { if (videoRef.current) videoRef.current.muted = m; },
    setPlaybackRate(rate: number) { if (videoRef.current) videoRef.current.playbackRate = rate; },
  }));
  const [errorMessage, setErrorMessage] = useState<string>('');
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const initPlayer = () => {
      // Cleanup previous instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      setStatus('loading');
      setErrorMessage('');
      // Check if HLS is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: (xhr) => {
            if (accessToken) {
              xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            }
          },
        });

        hlsRef.current = hls;

        hls.loadSource(src);

        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(() => {
              // Autoplay blocked, user needs to interact
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          // Handle 401 - refresh token and retry
          if (data.response?.code === 401) {
            // refreshToken().then(() => {
            //   hls.startLoad();
            // });
            return;
          }

          if (data.fatal) {
            setStatus('error');
            setErrorMessage(data.details || 'Erro ao carregar stream');
            onError?.(new Error(data.details));

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Try to recover by refreshing token and reloading
                // refreshToken().then(() => {
                //   hls.startLoad();
                // });
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        if (autoPlay) {
          video.play().catch(() => {});
        }
      } else {
        setStatus('error');
        setErrorMessage('HLS não suportado neste navegador');
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onError, accessToken]);

  const handlePlaying = () => {
    setStatus('playing');
    onPlaying?.();
  };

  const handleWaiting = () => {
    setStatus('loading');
  };

  return (
    <div className={cn('relative bg-black w-full h-full', className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted={muted}
        controls={controls}
        playsInline
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onPause={onPause}
        onEnded={onEnded}
      />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
          <p className="text-sm text-center px-4">{errorMessage || 'Erro ao carregar'}</p>
        </div>
      )}
    </div>
  );
});
