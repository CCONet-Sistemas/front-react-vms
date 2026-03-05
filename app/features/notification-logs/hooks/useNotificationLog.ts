import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationLogService } from '~/services/api/notificationLogService';
import type { NotificationLogListParams, SendNotificationDto } from '~/types/notification-log.types';

export const notificationLogKeys = {
  all: ['notification-logs'] as const,
  lists: () => [...notificationLogKeys.all, 'list'] as const,
  list: (params?: NotificationLogListParams) => [...notificationLogKeys.lists(), params] as const,
  details: () => [...notificationLogKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...notificationLogKeys.details(), uuid] as const,
};

export function useNotificationLogList(params?: NotificationLogListParams) {
  return useQuery({
    queryKey: notificationLogKeys.list(params),
    queryFn: () => notificationLogService.list(params),
    staleTime: 30_000,
  });
}

export function useNotificationLog(uuid: string) {
  return useQuery({
    queryKey: notificationLogKeys.detail(uuid),
    queryFn: () => notificationLogService.getById(uuid),
    enabled: !!uuid,
    staleTime: 30_000,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendNotificationDto) => notificationLogService.send(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationLogKeys.lists() });
    },
  });
}

export function useRetryNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => notificationLogService.retry(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: notificationLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationLogKeys.detail(uuid) });
    },
  });
}
