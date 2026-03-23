import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cameraService, type CameraListParams } from '~/services/api/cameraService';
import { useCameraStatusStore, selectCameraStatus } from '~/store/camera-status.store';
import type { StreamStatus } from '~/types/camera.types';

export const cameraKeys = {
  all: ['cameras'] as const,
  lists: () => [...cameraKeys.all, 'list'] as const,
  list: (params?: CameraListParams) => [...cameraKeys.lists(), params] as const,
  details: () => [...cameraKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...cameraKeys.details(), uuid] as const,
  status: (uuid: string) => [...cameraKeys.all, 'status', uuid] as const,
};

export function useCameras(params?: CameraListParams & { enabled?: boolean }) {
  const { enabled = true, ...listParams } = params ?? {};
  return useQuery({
    queryKey: cameraKeys.list(listParams),
    queryFn: () => cameraService.list(listParams),
    staleTime: 30000,
    enabled,
  });
}

export function useCamera(uuid: string) {
  return useQuery({
    queryKey: cameraKeys.detail(uuid),
    queryFn: () => cameraService.getById(uuid),
    enabled: !!uuid,
  });
}

export function useCameraStatus(uuid: string) {
  // Get realtime status from store (updated via WebSocket)
  const realtimeStatus = useCameraStatusStore(selectCameraStatus(uuid));

  const query = useQuery({
    queryKey: cameraKeys.status(uuid),
    queryFn: () => cameraService.getStatus(uuid),
    enabled: !!uuid,
    staleTime: 30000, // Status is kept fresh via WebSocket
  });

  // Prefer realtime status from store if available, fallback to query data
  const status: StreamStatus | undefined = realtimeStatus ?? query.data;

  return {
    ...query,
    data: status,
  };
}

export function useCreateCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cameraService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.lists() });
    },
  });
}

export function useUpdateCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Parameters<typeof cameraService.update>[1] }) =>
      cameraService.update(uuid, data),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cameraKeys.detail(uuid) });
    },
  });
}

export function useDeleteCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cameraService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.lists() });
    },
  });
}

export function useStartCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cameraService.start,
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.status(uuid) });
      queryClient.invalidateQueries({ queryKey: cameraKeys.detail(uuid) });
    },
  });
}

export function useStopCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cameraService.stop,
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.status(uuid) });
      queryClient.invalidateQueries({ queryKey: cameraKeys.detail(uuid) });
    },
  });
}
