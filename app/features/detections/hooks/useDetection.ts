import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { detectionService } from '~/services/api/detectionService';
import type { CreateDetectionDto, UpdateDetectionDto } from '~/types/detection.types';

export const detectionKeys = {
  byCameraId: (cameraId: string) => ['detections', 'camera', cameraId] as const,
};

export function useDetectionByCameraId(cameraId: string) {
  return useQuery({
    queryKey: detectionKeys.byCameraId(cameraId),
    queryFn: () => detectionService.getByCameraId(cameraId),
    enabled: !!cameraId,
    retry: false,
  });
}

export function useCreateDetection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cameraId, dto }: { cameraId: string; dto: CreateDetectionDto }) =>
      detectionService.create(cameraId, dto),
    onSuccess: (_, { cameraId }) => {
      queryClient.invalidateQueries({ queryKey: detectionKeys.byCameraId(cameraId) });
    },
  });
}

export function useUpdateDetection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: { uuid: string; dto: UpdateDetectionDto }) =>
      detectionService.update(uuid, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: detectionKeys.byCameraId(data.cameraId) });
    },
  });
}

export function useDeleteDetection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, cameraId }: { uuid: string; cameraId: string }) =>
      detectionService.delete(uuid),
    onSuccess: (_, { cameraId }) => {
      queryClient.invalidateQueries({ queryKey: detectionKeys.byCameraId(cameraId) });
    },
  });
}
