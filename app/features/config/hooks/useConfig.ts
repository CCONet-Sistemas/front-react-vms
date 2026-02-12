import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '~/services/api/configService';
import type { ConfigListParams, CreateConfigDto, UpdateConfigDto } from '~/types';

export const configKeys = {
  all: ['configurations'] as const,
  lists: () => [...configKeys.all, 'list'] as const,
  list: (params?: ConfigListParams) => [...configKeys.lists(), params] as const,
  details: () => [...configKeys.all, 'detail'] as const,
  detail: (key: string) => [...configKeys.details(), key] as const,
};

export function useConfigs(params?: ConfigListParams) {
  return useQuery({
    queryKey: configKeys.list(params),
    queryFn: () => configService.list(params),
    staleTime: 30000,
  });
}

export function useCreateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConfigDto) => configService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() });
    },
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateConfigDto }) =>
      configService.update(key, data),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() });
      queryClient.invalidateQueries({ queryKey: configKeys.detail(key) });
    },
  });
}

export function useDeleteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => configService.delete(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.lists() });
    },
  });
}
