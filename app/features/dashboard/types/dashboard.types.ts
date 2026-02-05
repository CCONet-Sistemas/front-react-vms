// Health check response (/health)
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  info: Record<string, { status: 'up' | 'down' }>;
  error: Record<string, { status: 'down'; message?: string }>;
  details: Record<string, { status: 'up' | 'down'; message?: string }>;
}

// Disk info
export interface DiskInfo {
  total: number;
  used: number;
  available: number;
  usagePercent: number;
}

// Storage info
export interface StorageInfo {
  status: 'up' | 'down';
  provider: string;
  path: string;
  readable: boolean;
  writable: boolean;
  exists: boolean;
  disk: DiskInfo;
}

// Queue metrics
export interface QueueMetrics {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed?: number;
}

// Queue thresholds
export interface QueueThresholds {
  maxActive: number;
  maxWaiting: number;
  maxFailed: number;
}

// Video queue info
export interface VideoQueueInfo {
  status: 'up' | 'down';
  metrics: QueueMetrics;
  thresholds: QueueThresholds;
}

// System health response (/system/health or /system/health/ready)
export interface SystemHealthResponse {
  status: 'ok' | 'error';
  info: {
    database?: { status: 'up' | 'down' };
    'video-queue'?: VideoQueueInfo;
    memory?: { status: 'up' | 'down' };
    rss?: { status: 'up' | 'down' };
    storage?: StorageInfo;
  };
  error: Record<string, { status: 'down'; message?: string }>;
  details: Record<string, unknown>;
}

// System metrics summary (/system/metrics/summary)
export interface SystemMetricsSummary {
  timestamp: string;
  queue: QueueMetrics;
}

// Parsed Prometheus metrics (from /health/metrics)
export interface PrometheusMetrics {
  // Process metrics
  cpuUsageSeconds: number;
  memoryResidentBytes: number;
  memoryHeapBytes: number;
  memoryHeapUsedBytes: number;

  // HTTP metrics
  httpRequestsTotal: Record<string, number>;

  // Media stream metrics
  mediaStreamsByState: Record<string, number>;

  // Queue metrics
  queueJobsActive: number;
  queueJobsWaiting: number;

  // Video processing
  videoProcessingFailedTotal: number;
}

// Dashboard summary (aggregated data)
export interface DashboardSummary {
  cameras: {
    total: number;
    online: number;
    offline: number;
    streaming: number;
    degraded: number;
    retrying: number;
  };
  events: {
    today: number;
    pending: number;
  };
  storage: {
    total: number;
    used: number;
    available: number;
    usagePercent: number;
  };
  queue: QueueMetrics;
  health: {
    database: 'up' | 'down' | 'unknown';
    storage: 'up' | 'down' | 'unknown';
    queue: 'up' | 'down' | 'unknown';
    overall: 'healthy' | 'degraded' | 'unhealthy';
  };
}
