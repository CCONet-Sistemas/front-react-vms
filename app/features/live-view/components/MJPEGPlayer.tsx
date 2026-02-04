import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useMJPEGStream } from '~/hooks/useMJPEGStream';
import { JPEGPlayer } from './JPEGPlayer';
import type { BasePlayerProps } from '../types/player.types';
import { DEFAULT_RECONNECT_CONFIG } from '../types/player.types';

interface MJPEGPlayerProps extends BasePlayerProps {
  fallbackToJpeg?: boolean;
  jpegUrl?: string;
}

// Check if URL is external (different origin) - these need native img tag due to CORS
function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function MJPEGPlayer({
  src,
  autoPlay = true,
  className,
  fallbackToJpeg = true,
  jpegUrl,
  onError,
  onPlaying,
}: MJPEGPlayerProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [hasReportedPlaying, setHasReportedPlaying] = useState(false);
  const [nativeImgLoaded, setNativeImgLoaded] = useState(false);
  const [nativeImgError, setNativeImgError] = useState(false);

  // Check if this is an external URL (use native img tag for CORS compatibility)
  const isExternal = useMemo(() => src ? isExternalUrl(src) : false, [src]);

  const { imageUrl, isConnected, isLoading, error, reconnect, attemptCount } = useMJPEGStream(
    src,
    {
      enabled: autoPlay && !useFallback && !isExternal,
      reconnectConfig: DEFAULT_RECONNECT_CONFIG,
    }
  );

  const onPlayingRef = useRef(onPlaying);
  onPlayingRef.current = onPlaying;

  // Handle fallback after max attempts (using useEffect to avoid setState during render)
  useEffect(() => {
    if (error && attemptCount >= DEFAULT_RECONNECT_CONFIG.maxAttempts && !useFallback) {
      if (fallbackToJpeg && (jpegUrl || src)) {
        setUseFallback(true);
      }
    }
  }, [error, attemptCount, useFallback, fallbackToJpeg, jpegUrl, src]);

  // Report playing state when connected (using useEffect to avoid setState during render)
  useEffect(() => {
    if (isConnected && imageUrl && !hasReportedPlaying) {
      setHasReportedPlaying(true);
      onPlayingRef.current?.();
    }
  }, [isConnected, imageUrl, hasReportedPlaying]);

  // Reset playing state when disconnected
  useEffect(() => {
    if (!isConnected && hasReportedPlaying) {
      setHasReportedPlaying(false);
    }
  }, [isConnected, hasReportedPlaying]);

  // Render JPEG fallback player
  if (useFallback) {
    const fallbackUrl = jpegUrl || src?.replace('/mjpeg', '/jpeg');
    return (
      <JPEGPlayer
        src={fallbackUrl || ''}
        autoPlay={autoPlay}
        className={className}
        onError={onError}
        onPlaying={onPlaying}
      />
    );
  }

  // For external URLs, use native img tag (CORS-friendly for MJPEG streams)
  if (isExternal && src) {
    return (
      <div className={cn('relative bg-black w-full h-full', className)}>
        <img
          src={src}
          alt="Camera stream"
          className="w-full h-full object-contain"
          onLoad={() => {
            setNativeImgLoaded(true);
            setNativeImgError(false);
            onPlaying?.();
          }}
          onError={() => {
            setNativeImgError(true);
            onError?.(new Error('Falha ao carregar stream MJPEG externo'));
          }}
        />

        {/* Loading overlay for native img */}
        {!nativeImgLoaded && !nativeImgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Error overlay for native img */}
        {nativeImgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
            <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
            <p className="text-sm text-center px-4">Erro ao carregar stream externo</p>
          </div>
        )}
      </div>
    );
  }

  // Show error state
  const showError = error && attemptCount >= DEFAULT_RECONNECT_CONFIG.maxAttempts;

  return (
    <div className={cn('relative bg-black w-full h-full', className)}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Camera stream"
          className="w-full h-full object-contain"
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {/* Reconnecting overlay */}
      {!isLoading && !isConnected && attemptCount > 0 && attemptCount < DEFAULT_RECONNECT_CONFIG.maxAttempts && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
          <RefreshCw className="h-6 w-6 mb-2 animate-spin" />
          <p className="text-sm">Reconectando... ({attemptCount}/{DEFAULT_RECONNECT_CONFIG.maxAttempts})</p>
        </div>
      )}

      {/* Error overlay */}
      {showError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
          <p className="text-sm text-center px-4 mb-3">
            {error?.message || 'Erro ao carregar stream'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setHasReportedPlaying(false);
                reconnect();
              }}
              className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Tentar novamente
            </button>
            {fallbackToJpeg && (
              <button
                onClick={() => setUseFallback(true)}
                className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Usar JPEG
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
