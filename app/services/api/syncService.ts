import { apiClient } from './client';

export const syncService = {
  syncEvents: async (): Promise<{ message: string; synced: number }> => {
    const { data } = await apiClient.post('/events/recordings/sync');
    return data;
  },
};
