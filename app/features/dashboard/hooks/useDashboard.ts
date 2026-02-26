import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '~/services/api/dashboardService';
import { cameraService } from '~/services/api/cameraService';
import { eventService } from '~/services/api/eventService';
import type { DashboardSummary } from '../types/dashboard.types';

const POLLING_INTERVAL = 30000; // 30 seconds

// Hook for basic health check
export function useHealthCheck(enabled = true) {
  return useQuery({
    queryKey: ['health'],
    queryFn: dashboardService.getHealth,
    refetchInterval: POLLING_INTERVAL,
    enabled,
    staleTime: 10000,
  });
}

// Hook for detailed system health
export function useSystemHealth(enabled = true) {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: dashboardService.getSystemHealth,
    refetchInterval: POLLING_INTERVAL,
    enabled,
    staleTime: 10000,
  });
}

// Hook for metrics summary
export function useMetricsSummary(enabled = true) {
  return useQuery({
    queryKey: ['metrics-summary'],
    queryFn: dashboardService.getMetricsSummary,
    refetchInterval: POLLING_INTERVAL,
    enabled,
    staleTime: 10000,
  });
}

// Hook for Prometheus metrics
export function usePrometheusMetrics(enabled = true) {
  return useQuery({
    queryKey: ['prometheus-metrics'],
    queryFn: dashboardService.getPrometheusMetrics,
    refetchInterval: POLLING_INTERVAL,
    enabled,
    staleTime: 10000,
  });
}

// Hook for camera stats
export function useCameraStats(enabled = true) {
  return useQuery({
    queryKey: ['camera-stats'],
    queryFn: async () => {
      const response = await cameraService.list({ per_page: 1000 });
      const cameras = response.data || [];
      const online = cameras.filter((c) => c.streamStatus?.state === 'streaming').length;
      const offline = cameras.filter((c) => c.streamStatus?.state === 'offline').length;
      const degraded = cameras.filter((c) => c.streamStatus?.state === 'degraded').length;
      const retrying = cameras.filter((c) => c.streamStatus?.state === 'retrying').length;
      const totalStream = online + degraded + retrying;

      return {
        total: cameras.length,
        online,
        offline,
        streaming: totalStream,
        degraded,
        retrying,
      };
    },
    refetchInterval: POLLING_INTERVAL,
    enabled,
    staleTime: 10000,
  });
}

// Hook for event stats (today)
export function useEventStats(enabled = true) {
  return useQuery({
    queryKey: ['event-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await eventService.list({
        startDate: today.toISOString(),
        limit: 1,
      });

      return {
        today: response.total || 0,
        pending: 0, // Would need specific endpoint
      };
    },
    refetchInterval: POLLING_INTERVAL,
    enabled,
    staleTime: 10000,
  });
}

// Combined dashboard hook
export function useDashboard(enabled = true) {
  const healthQuery = useSystemHealth(enabled);
  const metricsQuery = useMetricsSummary(enabled);
  const cameraQuery = useCameraStats(enabled);
  const eventQuery = useEventStats(enabled);

  const isLoading =
    healthQuery.isLoading ||
    metricsQuery.isLoading ||
    cameraQuery.isLoading ||
    eventQuery.isLoading;

  const isError =
    healthQuery.isError || metricsQuery.isError || cameraQuery.isError || eventQuery.isError;

  const health = healthQuery.data;
  const metrics = metricsQuery.data;
  const cameras = cameraQuery.data;
  const events = eventQuery.data;

  // Build summary
  const summary: DashboardSummary | null =
    health && cameras && events
      ? {
          cameras: cameras,
          events: events,
          storage: health.info?.storage?.disk || {
            total: 0,
            used: 0,
            available: 0,
            usagePercent: 0,
          },
          queue: metrics?.queue || {
            active: 0,
            waiting: 0,
            completed: 0,
            failed: 0,
          },
          health: {
            database: health.info?.database?.status || 'unknown',
            storage: health.info?.storage?.status || 'unknown',
            queue: health.info?.['video-queue']?.status || 'unknown',
            overall:
              health.status === 'ok'
                ? 'healthy'
                : Object.keys(health.error || {}).length > 0
                  ? 'unhealthy'
                  : 'degraded',
          },
        }
      : null;

  return {
    summary,
    health,
    metrics,
    cameras,
    events,
    isLoading,
    isError,
    refetch: () => {
      healthQuery.refetch();
      metricsQuery.refetch();
      cameraQuery.refetch();
      eventQuery.refetch();
    },
  };
}
