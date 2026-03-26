import type { PaginatedResponse } from './api.types';

// Camera Status
export type CameraMode = 'start' | 'stop' | 'idle';
export type CameraStatus = 'running' | 'stopped' | 'error' | 'idle';

// Connection settings
export interface CameraConnection {
  host: string;
  port: number;
  path: string;
  protocol: string;
  username: string;
  password: string;
  auto_host_enable: boolean;
  auto_host: string;
  rtsp_transport: 'tcp' | 'udp';
  isP2pEnabled: boolean;
  p2pSerialNumber: string;
}

export interface CameraHwaccel {
  enabled: boolean;
  method: string;
  device: string;
}

export interface CameraStream {
  streamType: string;
  flvTransportType: string;
  videoCodec: string;
  audioCodec: string;
  quality: string;
  fps: number;
}

export interface CameraSnapshot {
  enabled: boolean;
  fps: number;
}

export interface CameraVideo {
  ext: string;
  fps: number;
  quality: string;
  codec: string;
  width?: number;
  height?: number;
  hwaccel: CameraHwaccel;
  stream: CameraStream;
  snapshot: CameraSnapshot;
}

// Recording settings
export interface CameraWatermark {
  enabled: boolean;
  location: string;
  position: string;
}

export interface CameraRecording {
  videoCodec: string;
  audioCodec: string;
  crf: number;
  segmentDuration: number;
  retentionDays: number;
  watermark: CameraWatermark;
}

// PTZ Control
export type PtzProtocol = 'http_cgi' | 'onvif';
export type OnvifEventMode = 'pullpoint' | 'push' | 'both';

export interface CameraPtzCommands {
  left: string;
  right: string;
  up: string;
  down: string;
  zoom_in: string;
  zoom_out: string;
}

export interface CameraControl {
  enabled: boolean;
  base_url?: string | null;
  ptz_protocol?: PtzProtocol;
  onvif_port?: number;
  onvif_event_mode?: OnvifEventMode | null;
  commands?: CameraPtzCommands | null;
}

export interface UpdatePtzConfigDto {
  enabled: boolean;
  base_url?: string;
  ptz_protocol?: PtzProtocol;
  onvif_port?: number;
  onvif_event_mode?: OnvifEventMode | null;
}

// Logs
export interface CameraLogs {
  level: string;
  sql_log: boolean;
}

// Metadata
export interface CameraMetadata {
  groups: string[];
  notes: string;
}

export type StreamState =
  | 'created'
  | 'starting'
  | 'streaming'
  | 'degraded'
  | 'retrying'
  | 'paused'
  | 'offline'
  | 'stopped';

export interface StreamStatus {
  state: StreamState;
  isHealthy: boolean;
  fps: string; // ex: "15.00"
  bitrate: number;
  resolutionWidth: number;
  resolutionHeight: number;
  latencyMs: number | null;
  lastFrameAt: string | null; // ISO date
  lastHealthCheckAt: string | null; // ISO date
  retryCount: number;
  lastError: string | null;
  startedAt: string | null; // ISO date
  stoppedAt: string | null; // ISO date
}

export interface CameraImages {
  fileName: string;
  fileSize: number;
  createdAt: Date;
  uuid: string;
  thumbnailUrl: string;
}

// Main Camera interface
export interface Camera {
  uuid: string;
  externalId: string;
  name: string;
  type: string;
  protocol: string;
  mode: CameraMode;
  status: CameraStatus;
  connection: CameraConnection;
  video: CameraVideo;
  recording: CameraRecording;
  control: CameraControl;
  logs: CameraLogs;
  images: CameraImages[];
  metadata: CameraMetadata;
  streamStatus: StreamStatus;
}

// API Response
export type CameraListResponse = PaginatedResponse<Camera>;

// DTOs
export interface CreateCameraDto {
  name: string;
  externalId?: string;
  type?: string;
  protocol?: string;
  connection: Partial<CameraConnection>;
}

export interface UpdateCameraDto {
  name?: string;
  externalId?: string;
  connection?: Partial<CameraConnection>;
  recording?: Partial<CameraRecording>;
}

// Stream info
export interface CameraStreamInfo {
  cameraId: string;
  streamUrl: string;
  type: 'mjpeg' | 'hls' | 'jpeg' | 'flv';
}

export interface CameraStreamUrl {
  hlsUrl: string;
  expiresAt: string; // ISO date
  state: StreamState;
}
