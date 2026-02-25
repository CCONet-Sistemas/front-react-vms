import { useMutation } from '@tanstack/react-query';
import { backupService } from '~/services/api/backupService';
import type { RestoreParams } from '~/types/backup.types';

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
