import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../../services/api/eventService';
import type { EventListParams, EventStatus } from '~/types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: EventListParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...eventKeys.details(), uuid] as const,
};

export function useEvents(params?: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.list(params),
    staleTime: 30000,
  });
}

export function useEvent(uuid: string) {
  return useQuery({
    queryKey: eventKeys.detail(uuid),
    queryFn: () => eventService.getById(uuid),
    enabled: !!uuid,
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: EventStatus }) =>
      eventService.updateStatus(uuid, { status }),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(uuid) });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
