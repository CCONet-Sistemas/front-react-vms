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

// Video settings
export interface CameraVideoScale {
  x: number;
  y: number;
}

export interface CameraHwaccel {
  enabled: boolean;
  method: string;
  device: string;
}

export interface CameraStream {
  type: string;
  flv_type: string;
  vcodec: string;
  acodec: string;
  quality: number;
  fps: number;
  scale: CameraVideoScale;
}

export interface CameraSnapshot {
  enabled: boolean;
  fps: number;
  scale: CameraVideoScale;
}

export interface CameraVideo {
  ext: string;
  fps: number;
  width: number;
  height: number;
  codec: string;
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
  vcodec: string;
  acodec: string;
  crf: number;
  cutoff: string;
  storageDays: number;
  watermark: CameraWatermark;
}

// PTZ Control
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
  base_url: string;
  commands: CameraPtzCommands;
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
  stream: CameraStream;
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
