import { useState, useEffect } from 'react';
import { apiClient } from '~/services/api';

interface UseAuthImageOptions {
  enabled?: boolean;
}

export function useAuthImage(url: string | null, options: UseAuthImageOptions = {}) {
  const { enabled = true } = options;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !enabled) {
      setImageUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let isCancelled = false;

    const fetchImage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Fetch com o token do axios interceptor
        const response = await apiClient.get(url, {
          responseType: 'blob',
        });

        if (isCancelled) return;

        // Cria blob URL
        objectUrl = URL.createObjectURL(response.data);
        setImageUrl(objectUrl);
      } catch (err) {
        if (!isCancelled) {
          setError(true);
          setImageUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    // Cleanup: revoga blob URL para evitar memory leak
    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url, enabled]);

  return { imageUrl, isLoading, error };
}
