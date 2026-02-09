import { useQuery } from '@tanstack/react-query';
import { recordingService, type SessionSegmentsParams } from '~/services/api/recordingsService';

export const recordingKeys = {
  getAvailableRange: (uuid: string) => ['recordings', 'available-range', uuid] as const,
  getSessionSegments: (cameraId: string, params?: SessionSegmentsParams) =>
    ['recordings', 'sessions', cameraId, params] as const,
};

export function useAvailableRange(uuid: string) {
  return useQuery({
    queryKey: recordingKeys.getAvailableRange(uuid),
    queryFn: () => recordingService.getAvailableRange(uuid),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSessionSegments(cameraId: string, params?: SessionSegmentsParams) {
  return useQuery({
    queryKey: recordingKeys.getSessionSegments(cameraId, params),
    queryFn: () => recordingService.getSessionSegments(cameraId, params),
    staleTime: 5 * 60 * 1000,
  });
}
