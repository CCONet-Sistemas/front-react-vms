import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backupService } from '~/services/api/backupService';
import type { BackupListParams, CreateBackupDto, RestoreParams } from '~/types/backup.types';

export function useCreateBackup() {
  return useMutation({
    mutationFn: () => backupService.create(),
    onSuccess: (backup) => {
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (params: RestoreParams) => backupService.restore(params),
  });
}

export const backupKeys = {
  all: ['backups'] as const,
  lists: () => [...backupKeys.all, 'list'] as const,
  list: (params?: BackupListParams) => [...backupKeys.lists(), params] as const,
  statistics: () => [...backupKeys.all, 'statistics'] as const,
};

export function useBackupList(params?: BackupListParams) {
  return useQuery({
    queryKey: backupKeys.list(params),
    queryFn: () => backupService.listBackups(params),
    staleTime: 30_000,
  });
}

export function useBackupStatistics() {
  return useQuery({
    queryKey: backupKeys.statistics(),
    queryFn: () => backupService.getStatistics(),
    staleTime: 60_000,
  });
}

export function useCreateBackupRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBackupDto) => backupService.createBackupRecord(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backupKeys.statistics() });
    },
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => backupService.deleteBackup(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backupKeys.statistics() });
    },
  });
}

export function useValidateBackup() {
  return useMutation({
    mutationFn: (uuid: string) => backupService.validateBackup(uuid),
  });
}

export function useRestoreBackupById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => backupService.restoreBackup(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backupKeys.statistics() });
    },
  });
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: (uuid: string) => backupService.downloadBackup({ uuid }),
  });
}
