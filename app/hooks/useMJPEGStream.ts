import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '~/store/auth.store';
import {
  DEFAULT_RECONNECT_CONFIG,
  type ReconnectConfig,
} from '~/features/live-view/types/player.types';

interface UseMJPEGStreamOptions {
  enabled?: boolean;
  reconnectConfig?: Partial<ReconnectConfig>;
}

interface UseMJPEGStreamReturn {
  imageUrl: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  reconnect: () => void;
  attemptCount: number;
}

// Concatenate two Uint8Arrays
function concatArrays(a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

// Find boundary pattern in buffer
function findBoundary(buffer: Uint8Array, boundary: Uint8Array): number {
  for (let i = 0; i <= buffer.length - boundary.length; i++) {
    let found = true;
    for (let j = 0; j < boundary.length; j++) {
      if (buffer[i + j] !== boundary[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

// Find JPEG start marker (0xFF 0xD8)
function findJPEGStart(buffer: Uint8Array, startIndex: number = 0): number {
  for (let i = startIndex; i < buffer.length - 1; i++) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd8) {
      return i;
    }
  }
  return -1;
}

// Find JPEG end marker (0xFF 0xD9)
function findJPEGEnd(buffer: Uint8Array, startIndex: number = 0): number {
  for (let i = startIndex; i < buffer.length - 1; i++) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd9) {
      return i + 2; // Include the end marker
    }
  }
  return -1;
}

export function useMJPEGStream(
  url: string | null,
  options: UseMJPEGStreamOptions = {}
): UseMJPEGStreamReturn {
  const { enabled = true, reconnectConfig: customConfig } = options;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const accessToken = useAuthStore((state) => state.accessToken);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousBlobUrl = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Use ref for config to avoid recreating processStream on every render
  const configRef = useRef({ ...DEFAULT_RECONNECT_CONFIG, ...customConfig });
  configRef.current = { ...DEFAULT_RECONNECT_CONFIG, ...customConfig };

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (previousBlobUrl.current) {
      URL.revokeObjectURL(previousBlobUrl.current);
      previousBlobUrl.current = null;
    }
  }, []);

  const processStream = useCallback(
    async (streamUrl: string, attempt: number) => {
      if (!isMountedRef.current) return;

      cleanup();
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(streamUrl, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          // Create error with status code for retry logic
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as any).status = response.status;
          throw error;
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }

        // Parse boundary from content-type header
        const contentType = response.headers.get('content-type') || '';
        const boundaryMatch = contentType.match(/boundary=(?:--)?(.+?)(?:;|$)/i);
        const boundaryStr = boundaryMatch ? `--${boundaryMatch[1].trim()}` : '--boundary';
        const boundaryBytes = new TextEncoder().encode(boundaryStr);

        if (!isMountedRef.current) return;

        setIsConnected(true);
        setIsLoading(false);
        setAttemptCount(0);

        const reader = response.body.getReader();
        let buffer = new Uint8Array(0);

        while (true) {
          const { done, value } = await reader.read();

          if (done || !isMountedRef.current) {
            break;
          }

          // Concatenate new data to buffer
          buffer = concatArrays(buffer, value);

          // Try to extract JPEG frames
          while (true) {
            // First, try to find JPEG markers directly (more reliable)
            const jpegStart = findJPEGStart(buffer);
            if (jpegStart === -1) {
              // Keep last 2 bytes in case JPEG start marker is split
              if (buffer.length > 2) {
                buffer = buffer.slice(buffer.length - 2);
              }
              break;
            }

            const jpegEnd = findJPEGEnd(buffer, jpegStart);
            if (jpegEnd === -1) {
              // Wait for more data, but limit buffer size to prevent memory issues
              if (buffer.length > 5 * 1024 * 1024) {
                // 5MB max
                buffer = buffer.slice(jpegStart);
              }
              break;
            }

            // Extract JPEG frame
            const jpegData = buffer.slice(jpegStart, jpegEnd);
            buffer = buffer.slice(jpegEnd);

            // Create blob URL and update state
            const blob = new Blob([jpegData], { type: 'image/jpeg' });

            // Revoke previous URL before creating new one
            if (previousBlobUrl.current) {
              URL.revokeObjectURL(previousBlobUrl.current);
            }

            const newUrl = URL.createObjectURL(blob);
            previousBlobUrl.current = newUrl;

            if (isMountedRef.current) {
              setImageUrl(newUrl);
            }
          }
        }

        // Stream ended naturally
        if (isMountedRef.current) {
          setIsConnected(false);
          throw new Error('Stream ended unexpectedly');
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore abort errors
        }

        const errorObj = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        setIsConnected(false);
        setIsLoading(false);

        // Check if error is retryable (only network errors and 5xx server errors)
        const httpStatus = (err as any)?.status;
        const isClientError = httpStatus && httpStatus >= 400 && httpStatus < 500;
        const isRetryable = !isClientError; // Network errors (no status) or 5xx errors

        // Schedule reconnection with exponential backoff (only for retryable errors)
        const config = configRef.current;
        if (isRetryable && attempt < config.maxAttempts) {
          const delay = Math.min(
            config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
            config.maxDelay
          );

          setAttemptCount(attempt + 1);

          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && url) {
              processStream(url, attempt + 1);
            }
          }, delay);
        } else {
          // For non-retryable errors, set attempt count to max to show error state immediately
          setAttemptCount(config.maxAttempts);
        }
      }
    },
    [accessToken, cleanup, url]
  );

  const reconnect = useCallback(() => {
    if (url) {
      setAttemptCount(0);
      processStream(url, 0);
    }
  }, [url, processStream]);

  // Start stream when URL changes or enabled state changes
  useEffect(() => {
    isMountedRef.current = true;

    if (!url || !enabled) {
      // Cleanup without calling the callback (to avoid dependency)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }
      setImageUrl(null);
      setIsConnected(false);
      setIsLoading(false);
      setError(null);
      setAttemptCount(0);
      return;
    }

    processStream(url, 0);

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, accessToken]);

  return {
    imageUrl,
    isConnected,
    isLoading,
    error,
    reconnect,
    attemptCount,
  };
}
