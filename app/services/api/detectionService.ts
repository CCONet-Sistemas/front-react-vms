import type { Detection, CreateDetectionDto, UpdateDetectionDto } from '~/types/detection.types';
import { apiClient } from './client';

export const detectionService = {
  list: async (): Promise<Detection[]> => {
    const { data } = await apiClient.get<Detection[]>('/camera/detections');
    return data;
  },

  getByCameraId: async (cameraId: string): Promise<Detection | null> => {
    const { data } = await apiClient.get<Detection>(`/camera/detections/${cameraId}`);
    return data;
  },

  create: async (cameraId: string, dto: CreateDetectionDto): Promise<Detection> => {
    const { data } = await apiClient.post<Detection>(`/camera/detections/${cameraId}`, dto);
    return data;
  },

  update: async (uuid: string, dto: UpdateDetectionDto): Promise<Detection> => {
    const { data } = await apiClient.put<Detection>(`/camera/detections/${uuid}`, dto);
    return data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/camera/detections/${uuid}`);
  },
};
