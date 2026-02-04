import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2, Pause, Play } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useAuthStore } from '~/store/auth.store';
import type { BasePlayerProps, PlayerStatus } from '../types/player.types';

interface JPEGPlayerProps extends BasePlayerProps {
  pollingInterval?: number;
}

export function JPEGPlayer({
  src,
  autoPlay = true,
  className,
  pollingInterval = 1000,
  onError,
  onPlaying,
}: JPEGPlayerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPaused, setIsPaused] = useState(!autoPlay);

  const accessToken = useAuthStore((state) => state.accessToken);
  const previousBlobUrl = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Use ref for fatal error to stop immediately (state is async)
  const hasFatalErrorRef = useRef(false);

  // Use refs to avoid recreating fetchFrame on every status change
  const statusRef = useRef(status);
  statusRef.current = status;
  const onPlayingRef = useRef(onPlaying);
  onPlayingRef.current = onPlaying;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Stop polling helper
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchFrame = useCallback(async () => {
    // Check ref immediately to prevent any more requests
    if (!src || isPaused || hasFatalErrorRef.current) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(src, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Check if it's a client error (4xx) - these are fatal, don't retry
        if (response.status >= 400 && response.status < 500) {
          hasFatalErrorRef.current = true;
          stopPolling();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Revoke previous blob URL to avoid memory leaks
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
      }

      const newUrl = URL.createObjectURL(blob);
      previousBlobUrl.current = newUrl;
      setImageUrl(newUrl);

      if (statusRef.current !== 'playing') {
        setStatus('playing');
        onPlayingRef.current?.();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Ignore abort errors
      }

      setStatus('error');
      const message = error instanceof Error ? error.message : 'Erro ao carregar frame';
      setErrorMessage(message);
      onErrorRef.current?.(error instanceof Error ? error : new Error(message));
    }
  }, [src, accessToken, isPaused, stopPolling]);

  // Start/stop polling based on pause state
  useEffect(() => {
    // Reset fatal error when src changes
    hasFatalErrorRef.current = false;

    if (isPaused || !src) {
      stopPolling();
      return;
    }

    // Fetch first frame immediately
    fetchFrame();

    // Start polling interval
    intervalRef.current = setInterval(fetchFrame, pollingInterval);

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, isPaused, pollingInterval, accessToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const togglePause = () => {
    setIsPaused((prev) => {
      const newPaused = !prev;
      setStatus(newPaused ? 'paused' : 'loading');
      return newPaused;
    });
  };

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
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {/* Pause overlay */}
      {status === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <button
            onClick={togglePause}
            className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Play className="h-8 w-8 text-white" />
          </button>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
          <p className="text-sm text-center px-4">{errorMessage || 'Erro ao carregar'}</p>
        </div>
      )}

      {/* Play/Pause control (visible on hover when playing) */}
      {status === 'playing' && (
        <button
          onClick={togglePause}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors opacity-0 hover:opacity-100"
        >
          <Pause className="h-4 w-4 text-white" />
        </button>
      )}
    </div>
  );
}
