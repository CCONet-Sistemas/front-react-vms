export type RecordingControlState = 'recording' | 'paused' | 'stopped' | 'error' | 'idle';

export interface RecordingControlStatus {
  cameraId: string;
  controlState: RecordingControlState;
  isRecording: boolean;
  isPaused: boolean;
  sessionId?: string;
  startedAt?: string;
  errorMessage?: string;
}

export interface RecordingAvailableRange {
  cameraId: string;
  startTime: string;
  endTime: string;
  hasRecording: boolean;
}

export interface RecordingSessions {
  id: number;
  uuid: string;
  cameraId: string;
  status: string;
  startedAt: string;
  stoppedAt: string | null;
  segmentsPath: string;
  totalSegments: number;
  totalSize: string;
  totalDuration: number;
  lastSegmentAt: string;
  errorMessage: string | null;
  retentionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ExtractionQuality = 'low' | 'medium' | 'high' | 'original';
export type ExtractionResolution = '480p' | '720p' | '1080p' | 'original';
export type ExtractionCodec = 'h264' | 'h265' | 'copy';

export interface ExtractionProcessConfig {
  compress?: { quality: ExtractionQuality };
  resize?: { resolution: ExtractionResolution };
  reencode?: { codec: ExtractionCodec };
}

export interface ExtractionRequest {
  startTime: string;
  endTime: string;
  processConfig: ExtractionProcessConfig;
  outputFileName: string;
}

export type ExtractionJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ExtractionJob {
  jobId: string;
  cameraId: string;
  status: ExtractionJobStatus;
  progress: number;
  outputFileName: string;
  downloadUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
