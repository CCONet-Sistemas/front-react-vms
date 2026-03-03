export type RestoreStrategy = 'merge' | 'replace' | 'selective';

export interface BackupData {
  version: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface RestoreParams {
  file: File;
  strategy?: RestoreStrategy;
  keys?: string;
  createBackupBeforeRestore?: boolean;
  dryRun?: boolean;
}

export interface RestoreResult {
  success: boolean;
  message?: string;
  applied?: number;
  skipped?: number;
}

export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'VALIDATING' | 'VALIDATED';
export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'MANUAL' | 'SCHEDULED';

export interface Backup {
  uuid: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size: number;
  createdAt: string;
  completedAt?: string;
  description?: string;
}

export interface BackupListParams {
  page?: number;
  limit?: number;
  status?: BackupStatus;
  type?: BackupType;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BackupStatistics {
  total: number;
  totalSize: number;
  successRate: number;
  lastBackupAt?: string;
  successCount: number;
  failedCount: number;
}

export interface BackupValidationResult {
  valid: boolean;
  message?: string;
  errors?: string[];
}

export interface CreateBackupDto {
  name?: string;
  description?: string;
  type: BackupType;
}

export interface BackupDownloadInfo {
  url: string;
  fileName: string;
  size: number;
  expiresIn: number;
  expiresAt: string;
  checksum: string;
}

export type BackupListResponse = import('./api.types').PaginatedResponse<Backup>;
