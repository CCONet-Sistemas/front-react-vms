export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'event';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: {
    eventUuid?: string;
    cameraUuid?: string;
    actionUrl?: string;
  };
}
