import { apiClient } from './client';
import type { Group, GroupListParams, PaginatedResponse } from '~/types';

export type GroupListResponse = PaginatedResponse<Group>;

export const groupService = {
  list: async (params?: GroupListParams): Promise<GroupListResponse> => {
    const { data } = await apiClient.get<GroupListResponse>('/groups', { params });
    return data;
  },

  getById: async (id: number): Promise<Group> => {
    const { data } = await apiClient.get<Group>(`/groups/${id}`);
    return data;
  },
};
