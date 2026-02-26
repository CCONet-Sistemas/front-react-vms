import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerService } from '~/services/api/triggerService';
import type { CreateTriggerDto, UpdateTriggerDto } from '~/types/trigger.types';

export const triggerKeys = {
  all: ['triggers'] as const,
  camera: (cameraId: string) => ['triggers', 'camera', cameraId] as const,
};

export function useCameraTrigger(cameraId: string) {
  return useQuery({
    queryKey: triggerKeys.camera(cameraId),
    queryFn: () => triggerService.getCameraTrigger(cameraId),
    enabled: !!cameraId,
    retry: false,
  });
}

export function useCreateTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cameraId, dto }: { cameraId: string; dto: CreateTriggerDto }) =>
      triggerService.create(cameraId, dto),
    onSuccess: (_, { cameraId }) => {
      queryClient.invalidateQueries({ queryKey: triggerKeys.camera(cameraId) });
    },
  });
}

export function useUpdateTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cameraId, dto }: { cameraId: string; dto: UpdateTriggerDto }) =>
      triggerService.update(cameraId, dto),
    onSuccess: (_, { cameraId }) => {
      queryClient.invalidateQueries({ queryKey: triggerKeys.camera(cameraId) });
    },
  });
}

export function useTestTrigger() {
  return useMutation({
    mutationFn: (cameraId: string) => triggerService.test(cameraId),
  });
}
