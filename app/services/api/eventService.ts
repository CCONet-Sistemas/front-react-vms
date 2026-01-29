import { apiClient } from '~/services/api/client';
import type { Event, EventListResponse, EventListParams, UpdateEventStatusDto } from '~/types';

export const eventService = {
  list: async (params?: EventListParams): Promise<EventListResponse> => {
    const { data } = await apiClient.get<EventListResponse>('/events', { params });
    return data;
  },

  getById: async (uuid: string): Promise<Event> => {
    const { data } = await apiClient.get<Event>(`/events/${uuid}`);
    return data;
  },

  updateStatus: async (uuid: string, payload: UpdateEventStatusDto): Promise<Event> => {
    const { data } = await apiClient.patch<Event>(`/events/${uuid}`, payload);
    return data;
  },

  acknowledge: async (uuid: string): Promise<Event> => {
    const { data } = await apiClient.patch<Event>(`/events/${uuid}/acknowledge`);
    return data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/events/${uuid}`);
  },
};
