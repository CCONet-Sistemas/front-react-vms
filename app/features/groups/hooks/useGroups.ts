import { useQuery } from '@tanstack/react-query';
import { groupService } from '~/services/api/groupService';
import type { GroupListParams } from '~/types';

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (params?: GroupListParams) => [...groupKeys.lists(), params] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: number) => [...groupKeys.details(), id] as const,
};

export function useGroups(params?: GroupListParams) {
  return useQuery({
    queryKey: groupKeys.list(params),
    queryFn: () => groupService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupService.getById(id),
    enabled: !!id,
  });
}
