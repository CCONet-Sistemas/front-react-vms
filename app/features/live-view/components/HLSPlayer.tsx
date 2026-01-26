import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuthStore } from '~/store/auth.store';
import { apiClient } from '~/services/api';

// Refresh token 1 minute before expiration (14 minutes)
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;
interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onPlaying?: () => void;
}

export function HLSPlayer({
  src,
  autoPlay = true,
  muted = true,
  className,
  onError,
  onPlaying,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  // Refresh token function
  // const refreshToken = useCallback(async () => {
  //   try {
  //     const { data } = await apiClient.post<{ accessToken: string }>('/authentication/refresh');
  //     console.log('HLS: Token refreshed:', data.accessToken);
  //     setAccessToken(data.accessToken);
  //     console.log('HLS: Token refreshed successfully');
  //   } catch (error) {
  //     console.error('HLS: Failed to refresh token', error);
  //   }
  // }, [setAccessToken]);

  // Auto-refresh token every 14 minutes
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     refreshToken();
  //   }, TOKEN_REFRESH_INTERVAL);

  //   return () => clearInterval(intervalId);
  // }, [refreshToken]);

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
            console.log('HLS: Unauthorized (401), refreshing token...');
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
        playsInline
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
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
}
