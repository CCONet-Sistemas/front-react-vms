export interface DetectionRegion {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tag: string;
  points?: Array<{ x: number; y: number }>; // polygon mode
}

export interface Detection {
  uuid: string;
  cameraId: string;
  enabled: boolean;
  method: 'motion' | 'object' | 'both';
  sensitivity: number;
  threshold: number;
  maxSensitivity: number;
  detectorTimeout: number;
  detectorBuffer: number;
  detectorFps: number;
  detectorPam: number;
  scaleX: number;
  scaleY: number;
  detectMotion: boolean;
  detectObject: boolean;
  sendFrames: boolean;
  motionFirst: boolean;
  objectFilter: string;
  regions: DetectionRegion[];
  useDetectorFilters: number;
  detectorDeleteMotionlessVideos: number;
  detectorBufferSecondsBefore: number;
  detectorLockTimeout: number;
  detectorMotionSaveFrame: number;
  detectorColorThreshold: number;
  detectorMotionTileMode: number;
  detectorNoiseFilter: number;
  detectorNoiseFilterRange: number;
  detectorFrame: number;
}

export type CreateDetectionDto = Omit<Detection, 'uuid'>;
export type UpdateDetectionDto = Partial<CreateDetectionDto>;
