import { useQuery } from '@tanstack/react-query';
import { cameraService } from '~/services/api/cameraService';

/**
 * Inicia a stream de uma câmera via POST /stream/{cameraId}/start
 * e retorna a URL de transmissão fornecida pelo servidor.
 */
export function useStreamUrl(cameraId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stream-url', cameraId],
    queryFn: () => cameraService.startStream(cameraId!),
    enabled: !!cameraId,
    staleTime: Infinity,
    retry: 2,
  });

  return {
    url: data?.hlsUrl ?? '',
    isLoading,
    error: error as Error | null,
  };
}
