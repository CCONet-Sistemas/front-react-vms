import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { syncService } from '~/services/api/syncService';
import { eventKeys } from '~/features/events/hooks/useEvents';

export function useSyncEvents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => syncService.syncEvents(),
    onSuccess: (data) => {
      toast.success('Sincronização concluída!', { description: data.message });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: (error: Error) => {},
  });
}

export function useAutoSync(intervalMs: number, enabled: boolean) {
  const { mutate } = useSyncEvents();
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const id = setInterval(() => mutateRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
}
