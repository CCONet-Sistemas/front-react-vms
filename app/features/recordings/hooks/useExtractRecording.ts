import { useMutation, useQuery } from '@tanstack/react-query';
import { recordingService } from '~/services/api/recordingsService';
import type { ExtractionRequest } from '~/types/recordings.types';

export function useExtractRecording() {
  return useMutation({
    mutationFn: ({ cameraId, request }: { cameraId: string; request: ExtractionRequest }) =>
      recordingService.extractRecording(cameraId, request),
  });
}

export function useExtractionStatus(cameraId: string | null, jobId: string | null) {
  return useQuery({
    queryKey: ['extraction', 'status', cameraId, jobId],
    queryFn: () => recordingService.getExtractionStatus(cameraId!, jobId!),
    enabled: !!cameraId && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 3000;
    },
  });
}
