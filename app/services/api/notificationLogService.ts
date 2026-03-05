import type {
  NotificationLog,
  NotificationLogListParams,
  NotificationLogListResponse,
  SendNotificationDto,
} from '~/types/notification-log.types';
import { apiClient } from './client';

export const notificationLogService = {
  list: async (params?: NotificationLogListParams): Promise<NotificationLogListResponse> => {
    const { data } = await apiClient.get<NotificationLogListResponse>('/notifications', { params });
    return data;
  },

  getById: async (uuid: string): Promise<NotificationLog> => {
    const { data } = await apiClient.get<NotificationLog>(`/notifications/${uuid}`);
    return data;
  },

  send: async (dto: SendNotificationDto): Promise<NotificationLog> => {
    const { data } = await apiClient.post<NotificationLog>('/notifications/send', dto);
    return data;
  },

  retry: async (uuid: string): Promise<NotificationLog> => {
    const { data } = await apiClient.post<NotificationLog>(`/notifications/${uuid}/retry`);
    return data;
  },
};
