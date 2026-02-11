import { apiClient } from './client';
import type { VideoDetail, VideoListResponse } from '~/types';

export interface VideoListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const videoService = {
  list: async (params?: VideoListParams): Promise<VideoListResponse> => {
    const { data } = await apiClient.get<VideoListResponse>('/videos', { params });
    return data;
  },

  getById: async (uuid: string): Promise<VideoDetail> => {
    const { data } = await apiClient.get<VideoDetail>(`/videos/${uuid}/stream`);
    return data;
  },

  download: async (uuid: string): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`/videos/${uuid}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/videos/${uuid}`);
  },
};
