import { apiClient } from './client';
import type {
  HealthCheckResponse,
  SystemHealthResponse,
  SystemMetricsSummary,
  PrometheusMetrics,
} from '~/features/dashboard/types/dashboard.types';

// Parse Prometheus text format into structured data
function parsePrometheusMetrics(text: string): PrometheusMetrics {
  const metrics: PrometheusMetrics = {
    cpuUsageSeconds: 0,
    memoryResidentBytes: 0,
    memoryHeapBytes: 0,
    memoryHeapUsedBytes: 0,
    httpRequestsTotal: {},
    mediaStreamsByState: {},
    queueJobsActive: 0,
    queueJobsWaiting: 0,
    videoProcessingFailedTotal: 0,
  };

  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;

    // CPU usage
    if (line.startsWith('vms_process_cpu_seconds_total ')) {
      metrics.cpuUsageSeconds = parseFloat(line.split(' ')[1]) || 0;
    }

    // Memory
    if (line.startsWith('vms_process_resident_memory_bytes ')) {
      metrics.memoryResidentBytes = parseFloat(line.split(' ')[1]) || 0;
    }
    if (line.startsWith('vms_process_heap_bytes ')) {
      metrics.memoryHeapBytes = parseFloat(line.split(' ')[1]) || 0;
    }
    if (line.startsWith('vms_nodejs_heap_size_used_bytes ')) {
      metrics.memoryHeapUsedBytes = parseFloat(line.split(' ')[1]) || 0;
    }

    // HTTP requests
    if (line.startsWith('http_requests_total{')) {
      const match = line.match(/path="([^"]+)".*} (\d+)/);
      if (match) {
        metrics.httpRequestsTotal[match[1]] = parseInt(match[2], 10);
      }
    }

    // Media streams by state
    if (line.startsWith('media_streams_by_state{')) {
      const match = line.match(/state="([^"]+)"} (\d+)/);
      if (match) {
        metrics.mediaStreamsByState[match[1]] = parseInt(match[2], 10);
      }
    }

    // Queue jobs
    if (line.startsWith('queue_jobs_active ')) {
      metrics.queueJobsActive = parseInt(line.split(' ')[1], 10) || 0;
    }
    if (line.startsWith('queue_jobs_waiting ')) {
      metrics.queueJobsWaiting = parseInt(line.split(' ')[1], 10) || 0;
    }

    // Video processing
    if (line.startsWith('video_processing_failed_total ')) {
      metrics.videoProcessingFailedTotal = parseInt(line.split(' ')[1], 10) || 0;
    }
  }

  return metrics;
}

export const dashboardService = {
  // Basic health check
  getHealth: async (): Promise<HealthCheckResponse> => {
    const { data } = await apiClient.get<HealthCheckResponse>('/health');
    return data;
  },

  // Detailed system health
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    try {
      const { data } = await apiClient.get<SystemHealthResponse>('/system/health/ready');
      return data;
    } catch (error: any) {
      // API returns 503 when unhealthy, but still has useful data
      if (error.response?.data?.message) {
        return error.response.data.message as SystemHealthResponse;
      }
      throw error;
    }
  },

  // Metrics summary
  getMetricsSummary: async (): Promise<SystemMetricsSummary> => {
    const { data } = await apiClient.get<SystemMetricsSummary>('/system/metrics/summary');
    return data;
  },

  // Prometheus metrics (text format)
  getPrometheusMetrics: async (): Promise<PrometheusMetrics> => {
    const { data } = await apiClient.get<string>('/health/metrics', {
      headers: { Accept: 'text/plain' },
      transformResponse: [(data) => data], // Keep as string
    });
    return parsePrometheusMetrics(data);
  },
};
