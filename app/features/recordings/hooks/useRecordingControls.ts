import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordingService } from '~/services/api/recordingsService';

export const recordingControlKeys = {
  status: (cameraId: string) => ['recordings', 'status', cameraId] as const,
};

export function useRecordingStatus(cameraId: string) {
  return useQuery({
    queryKey: recordingControlKeys.status(cameraId),
    queryFn: () => recordingService.getStatus(cameraId),
    enabled: !!cameraId,
    refetchInterval: 5000,
  });
}

export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => recordingService.startRecording(cameraId),
    onSuccess: (_, cameraId) => {
      queryClient.invalidateQueries({ queryKey: recordingControlKeys.status(cameraId) });
    },
  });
}

export function useStopRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => recordingService.stopRecording(cameraId),
    onSuccess: (_, cameraId) => {
      queryClient.invalidateQueries({ queryKey: recordingControlKeys.status(cameraId) });
    },
  });
}

export function usePauseRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => recordingService.pauseRecording(cameraId),
    onSuccess: (_, cameraId) => {
      queryClient.invalidateQueries({ queryKey: recordingControlKeys.status(cameraId) });
    },
  });
}

export function useResumeRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => recordingService.resumeRecording(cameraId),
    onSuccess: (_, cameraId) => {
      queryClient.invalidateQueries({ queryKey: recordingControlKeys.status(cameraId) });
    },
  });
}
