import { useState, useCallback, useMemo } from 'react';
import { HLSPlayer } from './HLSPlayer';
import { MJPEGPlayer } from './MJPEGPlayer';
import { JPEGPlayer } from './JPEGPlayer';
import type { Camera } from '~/types';
import type { StreamType, BasePlayerProps } from '../types/player.types';

interface VideoPlayerProps extends BasePlayerProps {
  camera?: Camera;
  enableFallback?: boolean;
  preferredType?: StreamType;
}

// Fallback chain order
const FALLBACK_ORDER: StreamType[] = ['hls', 'mjpeg', 'jpeg'];

// Detect stream type from URL
function detectStreamType(url: string): StreamType {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('/mjpeg')) return 'mjpeg';
  if (lowerUrl.includes('/jpeg') || lowerUrl.includes('/jpg')) return 'jpeg';
  return 'hls'; // Default to HLS
}

// Build stream URL for a given type
function buildStreamUrl(baseUrl: string, cameraId: string, type: StreamType): string {
  // If URL already specifies a type, replace it
  const urlWithoutType = baseUrl.replace(/\/(hls|mjpeg|jpeg|jpg)(?:[?#]|$)/, '/');
  const base = urlWithoutType.includes('/stream/')
    ? urlWithoutType.replace(/\/stream\/[^/]+\/.*$/, `/stream/${cameraId}`)
    : `${import.meta.env.VITE_API_URL}/stream/${cameraId}`;

  return `${base}/${type}`;
}

export function VideoPlayer({
  camera,
  src,
  autoPlay = true,
  muted = true,
  className,
  enableFallback = false,
  preferredType,
  onError,
  onPlaying,
}: VideoPlayerProps) {
  // Detect initial stream type from URL or camera config
  const initialType = useMemo(() => {
    if (preferredType) return preferredType;
    if (camera?.video?.stream?.type) {
      const configType = camera.video.stream.type.toLowerCase();
      if (configType === 'mjpeg' || configType === 'jpeg' || configType === 'hls') {
        return configType as StreamType;
      }
    }
    if (src) return detectStreamType(src);
    return 'hls';
  }, [preferredType, camera?.video?.stream?.type, src]);

  const [currentType, setCurrentType] = useState<StreamType>(initialType);
  const [failedTypes, setFailedTypes] = useState<Set<StreamType>>(new Set());

  // Get camera ID
  const cameraId = camera?.uuid || '';

  // Build current stream URL
  const streamUrl = useMemo(() => {
    if (!enableFallback && src) return src;
    if (!cameraId && src) return src;
    if (!cameraId) return '';
    return buildStreamUrl(src || `${import.meta.env.VITE_API_URL}/stream/${cameraId}/hls`, cameraId, currentType);
  }, [src, cameraId, currentType, enableFallback]);

  // Handle player error with fallback logic
  const handleError = useCallback(
    (error: Error) => {
      if (!enableFallback) {
        onError?.(error);
        return;
      }

      // Mark current type as failed
      const newFailedTypes = new Set(failedTypes);
      newFailedTypes.add(currentType);
      setFailedTypes(newFailedTypes);

      // Find next available type in fallback order
      const currentIndex = FALLBACK_ORDER.indexOf(currentType);
      for (let i = currentIndex + 1; i < FALLBACK_ORDER.length; i++) {
        const nextType = FALLBACK_ORDER[i];
        if (!newFailedTypes.has(nextType)) {
          setCurrentType(nextType);
          return;
        }
      }

      // Also try types before current if they haven't failed
      for (let i = 0; i < currentIndex; i++) {
        const nextType = FALLBACK_ORDER[i];
        if (!newFailedTypes.has(nextType)) {
          setCurrentType(nextType);
          return;
        }
      }

      // All types failed
      onError?.(new Error('Todos os formatos de stream falharam'));
    },
    [currentType, enableFallback, failedTypes, onError]
  );

  // Handle playing state
  const handlePlaying = useCallback(() => {
    onPlaying?.();
  }, [onPlaying]);

  if (!streamUrl) {
    return null;
  }

  // Render appropriate player based on current type
  switch (currentType) {
    case 'mjpeg':
      return (
        <MJPEGPlayer
          src={streamUrl}
          autoPlay={autoPlay}
          className={className}
          fallbackToJpeg={false}
          onError={handleError}
          onPlaying={handlePlaying}
        />
      );

    case 'jpeg':
      return (
        <JPEGPlayer
          src={streamUrl}
          autoPlay={autoPlay}
          className={className}
          onError={handleError}
          onPlaying={handlePlaying}
        />
      );

    case 'hls':
    default:
      return (
        <HLSPlayer
          src={streamUrl}
          autoPlay={autoPlay}
          muted={muted}
          className={className}
          onError={handleError}
          onPlaying={handlePlaying}
        />
      );
  }
}
