import type { Route } from './+types/_app.dashboard';
import { useAuthStore } from '~/store';
import { Camera, Wifi, WifiOff, Bell, RefreshCw } from 'lucide-react';
import { PageContent, PageHeader } from '~/components/common';
import { Button } from '~/components/ui/button';
import {
  MetricCard,
  HealthStatus,
  StorageCard,
  QueueStatus,
} from '~/features/dashboard/components';
import { useDashboard } from '~/features/dashboard/hooks';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard | VMS' },
    { name: 'description', content: 'VMS Dashboard - Video Management System' },
  ];
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { summary, health, isLoading, refetch } = useDashboard();

  const cameraStats = [
    {
      title: 'Total de Câmeras',
      value: summary?.cameras.total ?? '-',
      icon: Camera,
      color: 'text-primary',
    },
    {
      title: 'Online',
      value: summary?.cameras.online ?? '-',
      icon: Wifi,
      color: 'text-green-500',
    },
    {
      title: 'Degradado',
      value: summary?.cameras.degraded ?? '-',
      icon: Wifi,
      color: 'text-yellow-500',
    },
    {
      title: 'Streaming',
      value: summary?.cameras.streaming ?? '-',
      icon: Wifi,
      color: 'text-green-500',
    },
    {
      title: 'Retrying',
      value: summary?.cameras.retrying ?? '-',
      icon: Wifi,
      color: 'text-amber-500',
    },
    {
      title: 'Offline',
      value: summary?.cameras.offline ?? '-',
      icon: WifiOff,
      color: 'text-destructive',
    },
    {
      title: 'Eventos Hoje',
      value: summary?.events.today ?? '-',
      icon: Bell,
      color: 'text-amber-500',
    },
  ];

  return (
    <PageContent variant="list">
      <PageHeader
        title="Dashboard"
        description={`Bem vindo, ${user?.name || 'Usuário'}!`}
        children={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameraStats.map((stat) => (
            <MetricCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Health and Storage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthStatus health={health ?? null} isLoading={isLoading} />
          <StorageCard disk={summary?.storage ?? null} isLoading={isLoading} />
        </div>

        {/* Queue Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QueueStatus queue={summary?.queue ?? null} isLoading={isLoading} />
        </div>
      </div>
    </PageContent>
  );
}
