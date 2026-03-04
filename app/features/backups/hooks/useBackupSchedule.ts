import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backupService } from '~/services/api/backupService';
import type {
  BackupScheduleListParams,
  CreateBackupScheduleDto,
  UpdateBackupScheduleDto,
} from '~/types/backup.types';

export const scheduleKeys = {
  all: ['backup-schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params?: BackupScheduleListParams) => [...scheduleKeys.lists(), params] as const,
  statistics: () => [...scheduleKeys.all, 'statistics'] as const,
  detail: (id: string) => [...scheduleKeys.all, id] as const,
  nextExecutions: (id: string) => [...scheduleKeys.detail(id), 'next-executions'] as const,
};

export function useScheduleList(params?: BackupScheduleListParams) {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => backupService.listSchedules(params),
    staleTime: 30_000,
  });
}

export function useScheduleStatistics() {
  return useQuery({
    queryKey: scheduleKeys.statistics(),
    queryFn: () => backupService.getScheduleStatistics(),
    staleTime: 60_000,
  });
}

export function useNextExecutions(id: string, enabled: boolean) {
  return useQuery({
    queryKey: scheduleKeys.nextExecutions(id),
    queryFn: () => backupService.getNextExecutions(id),
    staleTime: 0,
    enabled,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBackupScheduleDto) => backupService.createSchedule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBackupScheduleDto }) =>
      backupService.updateSchedule(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backupService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() });
    },
  });
}

export function useToggleSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backupService.toggleSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
    },
  });
}

export function useExecuteSchedule() {
  return useMutation({
    mutationFn: (id: string) => backupService.executeSchedule(id),
  });
}
