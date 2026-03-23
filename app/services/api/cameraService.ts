import { apiClient } from './client';
import type {
  Camera,
  CameraListResponse,
  CreateCameraDto,
  UpdateCameraDto,
  SearchParams,
  CameraStreamUrl,
} from '~/types';

export type PtzCommand = 'up' | 'down' | 'left' | 'right' | 'zoom_in' | 'zoom_out';

export type CameraListParams = SearchParams;

export const cameraService = {
  list: async (params?: CameraListParams): Promise<CameraListResponse> => {
    const { data } = await apiClient.get<CameraListResponse>('/camera', { params });
    return data;
  },

  getById: async (uuid: string): Promise<Camera> => {
    const { data } = await apiClient.get<Camera>(`/camera/${uuid}`);
    return data;
  },

  getStatus: async (uuid: string): Promise<{ status: string; mode: string }> => {
    const { data } = await apiClient.get<{ status: string; mode: string }>(
      `/camera/${uuid}/status`
    );
    return data;
  },

  create: async (payload: CreateCameraDto): Promise<Camera> => {
    const { data } = await apiClient.post<Camera>('/camera', payload);
    return data;
  },

  update: async (uuid: string, payload: UpdateCameraDto): Promise<Camera> => {
    const { data } = await apiClient.put<Camera>(`/camera/${uuid}`, payload);
    return data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/camera/${uuid}`);
  },

  start: async (uuid: string): Promise<void> => {
    await apiClient.post(`/camera/${uuid}/start`);
  },

  stop: async (uuid: string): Promise<void> => {
    await apiClient.post(`/camera/${uuid}/stop`);
  },

  ptz: async (uuid: string, command: PtzCommand): Promise<void> => {
    await apiClient.post(`/camera/${uuid}/ptz`, { command });
  },

  startStream: async (cameraId: string): Promise<CameraStreamUrl> => {
    const { data } = await apiClient.get<CameraStreamUrl>(`/camera/${cameraId}/ingest/start`);
    return data;
  },
};
