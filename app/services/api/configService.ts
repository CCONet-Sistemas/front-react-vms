import { apiClient } from './client';
import type {
  Configuration,
  CreateConfigDto,
  UpdateConfigDto,
  ConfigListParams,
  ConfigListResponse,
} from '~/types';

export const configService = {
  list: async (params?: ConfigListParams): Promise<ConfigListResponse> => {
    const { data } = await apiClient.get<ConfigListResponse>('/configurations', { params });
    return data;
  },

  getByKey: async (key: string): Promise<Configuration> => {
    const { data } = await apiClient.get<Configuration>(`/configurations/${key}`);
    return data;
  },

  create: async (payload: CreateConfigDto): Promise<Configuration> => {
    const { data } = await apiClient.post<Configuration>('/configurations', payload);
    return data;
  },

  update: async (key: string, payload: UpdateConfigDto): Promise<Configuration> => {
    const { data } = await apiClient.put<Configuration>(`/configurations/${key}`, payload);
    return data;
  },

  delete: async (key: string): Promise<void> => {
    await apiClient.delete(`/configurations/${key}`);
  },
};
