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
