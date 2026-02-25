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
