import { apiClient } from './client';
import type { User } from '~/types';

export const userService = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },
};
