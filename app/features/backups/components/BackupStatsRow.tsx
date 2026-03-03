import { CheckCircle2, Database, HardDrive } from 'lucide-react';
import { MetricCard } from '~/features/dashboard/components/MetricCard';
import type { BackupStatistics } from '~/types/backup.types';

function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '--';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface BackupStatsRowProps {
  statistics?: BackupStatistics;
  isLoading?: boolean;
}

export function BackupStatsRow({ statistics, isLoading }: BackupStatsRowProps) {
  const successRate = statistics?.successRate ?? 0;
  const successColor = successRate >= 80 ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard
        title="Total de Backups"
        value={statistics?.total ?? 0}
        icon={Database}
        isLoading={isLoading}
      />
      <MetricCard
        title="Tamanho Total"
        value={formatBytes(statistics?.totalSize ?? 0)}
        icon={HardDrive}
        isLoading={isLoading}
      />
      <MetricCard
        title="Taxa de Sucesso"
        value={`${successRate.toFixed(1)}%`}
        icon={CheckCircle2}
        color={isLoading ? 'text-primary' : successColor}
        isLoading={isLoading}
      />
    </div>
  );
}
