import { apiClient } from './client';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserListParams,
  PaginatedResponse,
} from '~/types';

export type UserListResponse = PaginatedResponse<User>;

export const userService = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  list: async (params?: UserListParams): Promise<UserListResponse> => {
    const { data } = await apiClient.get<UserListResponse>('/users', { params });
    return data;
  },

  getById: async (uuid: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${uuid}`);
    return data;
  },

  create: async (payload: CreateUserDto): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', payload);
    return data;
  },

  update: async (uuid: string, payload: UpdateUserDto): Promise<User> => {
    const { data } = await apiClient.put<User>(`/users/${uuid}`, payload);
    return data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/users/${uuid}`);
  },
};
