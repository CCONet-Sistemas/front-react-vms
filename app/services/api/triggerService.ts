import type { CameraTrigger, CreateTriggerDto, UpdateTriggerDto } from '~/types/trigger.types';
import { apiClient } from './client';

export const triggerService = {
  getCameraTrigger: async (cameraId: string): Promise<CameraTrigger | null> => {
    const { data } = await apiClient.get<CameraTrigger>(`/camera/triggers/${cameraId}`);
    return data;
  },

  create: async (cameraId: string, dto: CreateTriggerDto): Promise<CameraTrigger> => {
    const { data } = await apiClient.post<CameraTrigger>(`/camera/triggers/${cameraId}`, dto);
    return data;
  },

  update: async (cameraId: string, dto: UpdateTriggerDto): Promise<CameraTrigger> => {
    const { data } = await apiClient.put<CameraTrigger>(`/camera/triggers/${cameraId}`, {
      ...dto,
      cameraId,
    });
    return data;
  },

  test: async (cameraId: string): Promise<void> => {
    await apiClient.post(`/camera/triggers/${cameraId}/test`);
  },
};
