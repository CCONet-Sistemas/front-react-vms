export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
  timestamp?: string;
}

export interface WebSocketConfig {
  url: string;
  token?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

export type WebSocketEventHandler<T = unknown> = (data: T) => void;

// ==================== WebSocket Event Types ====================

// Camera event types
export type CameraEventType =
  | 'camera:status'
  | 'camera:edited'
  | 'camera:deleted'
  | 'camera:started'
  | 'camera:stopped';

// Video event types
export type VideoEventType =
  | 'video:completed'
  | 'video:deleted'
  | 'video:compress:progress'
  | 'video:compress:completed';

// Detection event types
export type DetectionEventType =
  | 'event:detected'
  | 'motion:detected'
  | 'detector:trigger';

// System event types
export type SystemEventType = 'system:status' | 'disk:usage';

// Sync event types
export type SyncEventType =
  | 'sync:started'
  | 'sync:progress'
  | 'sync:completed'
  | 'sync:failed';

// Notification severity
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical';

// ==================== WebSocket Event Payloads ====================

// camera:event payload
export interface CameraEventPayload {
  cameraId: string;
  type: CameraEventType;
  timestamp: string;
  data: {
    state?: 'created' | 'starting' | 'streaming' | 'degraded' | 'retrying' | 'paused' | 'offline' | 'stopped';
    isHealthy?: boolean;
    fps?: string;
    bitrate?: number;
    resolutionWidth?: number;
    resolutionHeight?: number;
    latencyMs?: number | null;
    lastFrameAt?: string | null;
    lastHealthCheckAt?: string | null;
    retryCount?: number;
    lastError?: string | null;
    startedAt?: string | null;
    stoppedAt?: string | null;
    [key: string]: unknown;
  };
}

// video:event payload
export interface VideoEventPayload {
  cameraId: string;
  type: VideoEventType;
  timestamp: string;
  data: {
    uuid?: string;
    videoId?: string;
    remoteVideoId?: string;
    videoPath?: string;
    thumbnailPath?: string;
    filename?: string;
    duration?: number;
    size?: number;
    progress?: number;
    message?: string;
    [key: string]: unknown;
  };
}

// detection:event payload
export interface DetectionEventPayload {
  cameraId: string;
  type: DetectionEventType;
  timestamp: string;
  data: {
    eventUuid?: string;
    confidence?: number;
    objectType?: string;
    reason?: string;
    region?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    [key: string]: unknown;
  };
}

// system:event payload
export interface SystemEventPayload {
  type: SystemEventType;
  timestamp: string;
  data: {
    diskUsage?: {
      total: number;
      used: number;
      free: number;
      percent: number;
    };
    [key: string]: unknown;
  };
}

// sync:event payload (FullCam sync)
export interface SyncEventPayload {
  type: SyncEventType;
  cameraId: string;
  timestamp: string;
  data: {
    cameraId: number;
    cameraExternalId: string;
    jobId: string;
    message: string;
    // sync:progress specific
    progress?: number;
    total?: number;
    processed?: number;
    // sync:completed specific
    totalVideos?: number;
    totalSize?: number;
    // sync:failed specific
    error?: string;
    [key: string]: unknown;
  };
}

// notification:new payload
export interface NotificationPayload {
  uuid: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Connected event payload
export interface ConnectedPayload {
  socketId: string;
  authenticated: boolean;
  timestamp: string;
}
