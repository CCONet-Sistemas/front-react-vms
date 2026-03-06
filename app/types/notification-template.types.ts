import type { PaginatedResponse } from './api.types';

export type NotificationTemplateType = 'email' | 'sms' | 'push' | 'webhook';

export interface DefaultNotificationTemplate {
  name: string;
  channel: NotificationTemplateType;
  description?: string;
}

export interface NotificationTemplate {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  channel: NotificationTemplateType;
  subject_template?: string;
  body_template: string;
  available_variables?: string[];
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationTemplateDto {
  name: string;
  description?: string;
  channel: NotificationTemplateType;
  subjectTemplate?: string;
  bodyTemplate: string;
  availableVariables?: string[];
  isActive: boolean;
}

export type UpdateNotificationTemplateDto = Partial<CreateNotificationTemplateDto>;

export interface NotificationTemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  channel?: NotificationTemplateType;
}

export type NotificationTemplateListResponse = PaginatedResponse<NotificationTemplate>;

export type TestTemplateDto = Record<string, string>;

export interface TestTemplateResponse {
  body: string;
  subject?: string;
}
