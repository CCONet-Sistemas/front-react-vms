import type {
  Backup,
  BackupData,
  BackupDownloadInfo,
  BackupListParams,
  BackupListResponse,
  BackupStatistics,
  BackupValidationResult,
  CreateBackupDto,
  RestoreParams,
  RestoreResult,
} from '~/types/backup.types';
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

  listBackups: async (params?: BackupListParams): Promise<BackupListResponse> => {
    const { data } = await apiClient.get<BackupListResponse>('/backups', { params });
    return data;
  },

  getStatistics: async (): Promise<BackupStatistics> => {
    const { data } = await apiClient.get<BackupStatistics>('/backups/statistics');
    return data;
  },

  createBackupRecord: async (dto: CreateBackupDto): Promise<Backup> => {
    const { data } = await apiClient.post<Backup>('/backups', dto);
    return data;
  },

  deleteBackup: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/backups/${uuid}`);
  },

  validateBackup: async (uuid: string): Promise<BackupValidationResult> => {
    const { data } = await apiClient.post<BackupValidationResult>(`/backups/${uuid}/validate`);
    return data;
  },

  restoreBackup: async (uuid: string): Promise<void> => {
    await apiClient.post(`/backups/${uuid}/restore`);
  },

  downloadBackup: async ({ uuid }: { uuid: string }): Promise<BackupDownloadInfo> => {
    const { data } = await apiClient.get<BackupDownloadInfo>(`/backups/${uuid}/download`);
    return data;
  },
};
