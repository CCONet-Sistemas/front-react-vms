import type { PaginatedResponse } from './api.types';

export type NotificationLogStatus = 'pending' | 'sent' | 'failed';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'webhook';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationLog {
  id: number;
  uuid: string;
  channel: NotificationChannel;
  status: NotificationLogStatus;
  priority: NotificationPriority;
  subject?: string | null;
  body: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  recipient_device_token?: string | null;
  recipient_webhook_url?: string | null;
  template_id?: number | null;
  template_variables?: Record<string, unknown> | null;
  triggered_by?: string | null;
  triggered_by_id?: string | null;
  retry_count: number;
  max_retries: number;
  scheduled_at?: string | null;
  sent_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  channel?: NotificationChannel;
  status?: NotificationLogStatus;
  startDate?: string;
  endDate?: string;
}

export type NotificationLogListResponse = PaginatedResponse<NotificationLog>;

export interface SendNotificationDto {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  priority?: NotificationPriority;
  templateId?: number;
  templateVariables?: Record<string, unknown>;
  scheduledAt?: string;
}
