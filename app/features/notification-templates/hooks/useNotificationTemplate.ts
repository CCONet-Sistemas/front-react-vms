import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationTemplateService } from '~/services/api/notificationTemplateService';
import type {
  NotificationTemplateListParams,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  TestTemplateDto,
} from '~/types/notification-template.types';

export const notificationTemplateKeys = {
  all: ['notification-templates'] as const,
  lists: () => [...notificationTemplateKeys.all, 'list'] as const,
  list: (params?: NotificationTemplateListParams) =>
    [...notificationTemplateKeys.lists(), params] as const,
  detail: (uuid: string) => [...notificationTemplateKeys.all, 'detail', uuid] as const,
};

export function useNotificationTemplateList(params?: NotificationTemplateListParams) {
  return useQuery({
    queryKey: notificationTemplateKeys.list(params),
    queryFn: () => notificationTemplateService.list(params),
    staleTime: 30_000,
  });
}

export function useNotificationTemplate(uuid: string) {
  return useQuery({
    queryKey: notificationTemplateKeys.detail(uuid),
    queryFn: () => notificationTemplateService.getById(uuid),
    enabled: !!uuid,
    staleTime: 30_000,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateNotificationTemplateDto) => notificationTemplateService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: { uuid: string; dto: UpdateNotificationTemplateDto }) =>
      notificationTemplateService.update(uuid, dto),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.detail(uuid) });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => notificationTemplateService.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
    },
  });
}

export function useTestNotificationTemplate() {
  return useMutation({
    mutationFn: ({ uuid, dto }: { uuid: string; dto?: TestTemplateDto }) =>
      notificationTemplateService.test(uuid, dto),
  });
}

export function useNotificationTemplateDefaults() {
  return useQuery({
    queryKey: [...notificationTemplateKeys.all, 'defaults'] as const,
    queryFn: () => notificationTemplateService.listDefaults(),
    staleTime: 5 * 60_000, // defaults rarely change
  });
}
