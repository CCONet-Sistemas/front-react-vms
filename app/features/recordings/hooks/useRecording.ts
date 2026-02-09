import { useQuery } from '@tanstack/react-query';
import { recordingService } from '~/services/api/recordingsService';

export const recordingKeys = {
  getAvailableRange: (uuid: string) => ['recordings', 'available-range', uuid] as const,
  getSessionSegments: (cameraId: string) => ['recordings', 'sessions', cameraId] as const,
};

export function useAvailableRange(uuid: string) {
  return useQuery({
    queryKey: recordingKeys.getAvailableRange(uuid),
    queryFn: () => recordingService.getAvailableRange(uuid),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSessionSegments(cameraId: string) {
  return useQuery({
    queryKey: recordingKeys.getSessionSegments(cameraId),
    queryFn: () => recordingService.getSessionSegments(cameraId),
    staleTime: 5 * 60 * 1000,
  });
}
