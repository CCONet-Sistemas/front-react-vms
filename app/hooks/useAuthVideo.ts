import { useState, useEffect } from 'react';
import { apiClient } from '~/services/api';

interface UseAuthVideoOptions {
  enabled?: boolean;
}

export function useAuthVideo(url: string | null, options: UseAuthVideoOptions = {}) {
  const { enabled = true } = options;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !enabled) {
      setVideoUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let isCancelled = false;

    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const response = await apiClient.get(url, {
          responseType: 'blob',
        });

        if (isCancelled) return;

        objectUrl = URL.createObjectURL(response.data);
        setVideoUrl(objectUrl);
      } catch (err) {
        if (!isCancelled) {
          setError(true);
          setVideoUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchVideo();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url, enabled]);

  return { videoUrl, isLoading, error };
}
