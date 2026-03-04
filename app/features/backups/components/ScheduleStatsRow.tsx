import { Activity, CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import { MetricCard } from '~/features/dashboard/components/MetricCard';
import type { BackupScheduleStatistics } from '~/types/backup.types';

interface ScheduleStatsRowProps {
  statistics?: BackupScheduleStatistics;
  isLoading?: boolean;
}

export function ScheduleStatsRow({ statistics, isLoading }: ScheduleStatsRowProps) {
  const successRate = statistics?.averageSuccessRate ?? 0;
  const successRateLabel = `${successRate}%`;
  const successColor = successRate >= 80 ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <MetricCard
        title="Total de Agendamentos"
        value={statistics?.total ?? 0}
        icon={CalendarClock}
        isLoading={isLoading}
      />
      <MetricCard
        title="Ativos"
        value={statistics?.active ?? 0}
        icon={Activity}
        isLoading={isLoading}
      />
      <MetricCard
        title="Taxa de Sucesso"
        value={successRateLabel}
        icon={CheckCircle2}
        color={isLoading ? 'text-primary' : successColor}
        isLoading={isLoading}
      />
      <MetricCard
        title="Execuções com Falha"
        value={statistics?.failedRuns ?? 0}
        icon={XCircle}
        color={isLoading ? 'text-primary' : (statistics?.failedRuns ?? 0) > 0 ? 'text-red-500' : undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
