import type {
  NotificationTemplate,
  NotificationTemplateListParams,
  NotificationTemplateListResponse,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  TestTemplateDto,
  TestTemplateResponse,
  DefaultNotificationTemplate,
} from '~/types/notification-template.types';
import { apiClient } from './client';

export const notificationTemplateService = {
  list: async (
    params?: NotificationTemplateListParams
  ): Promise<NotificationTemplateListResponse> => {
    const { data } = await apiClient.get<NotificationTemplateListResponse>(
      '/templates/notifications',
      { params }
    );
    return data;
  },

  getById: async (uuid: string): Promise<NotificationTemplate> => {
    const { data } = await apiClient.get<NotificationTemplate>(`/templates/notifications/${uuid}`);
    return data;
  },

  create: async (dto: CreateNotificationTemplateDto): Promise<NotificationTemplate> => {
    const { data } = await apiClient.post<NotificationTemplate>('/templates/notifications', dto);
    return data;
  },

  update: async (
    uuid: string,
    dto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplate> => {
    const { data } = await apiClient.put<NotificationTemplate>(
      `/templates/notifications/${uuid}`,
      dto
    );
    return data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/templates/notifications/${uuid}`);
  },

  test: async (uuid: string, dto?: TestTemplateDto): Promise<TestTemplateResponse> => {
    const { data } = await apiClient.post<TestTemplateResponse>(`/templates/notifications/${uuid}/test`, dto);
    return data;
  },

  listDefaults: async (): Promise<DefaultNotificationTemplate[]> => {
    const { data } = await apiClient.get<DefaultNotificationTemplate[]>(
      '/templates/notifications/defaults'
    );
    return data;
  },
};
