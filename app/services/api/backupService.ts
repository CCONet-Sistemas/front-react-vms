import type { BackupData, RestoreParams, RestoreResult } from '~/types/backup.types';
import { apiClient } from './client';

export const backupService = {
  create: async (): Promise<BackupData> => {
    const { data } = await apiClient.post<BackupData>('/configurations/backup');
    return data;
  },

  restore: async (params: RestoreParams): Promise<RestoreResult> => {
    const formData = new FormData();
    formData.append('file', params.file);

    if (params.strategy) formData.append('strategy', params.strategy);
    if (params.keys) formData.append('keys', params.keys);
    if (params.createBackupBeforeRestore !== undefined) {
      formData.append('createBackupBeforeRestore', String(params.createBackupBeforeRestore));
    }
    if (params.dryRun !== undefined) {
      formData.append('dryRun', String(params.dryRun));
    }

    const { data } = await apiClient.post<RestoreResult>('/configurations/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
