export interface Camera {
  id: string;
  name: string;
  description?: string;
  rtspUrl: string;
  status: CameraStatus;
  isRecording: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CameraStatus = 'online' | 'offline' | 'recording' | 'error';

export interface CreateCameraDto {
  name: string;
  description?: string;
  rtspUrl: string;
}

export interface UpdateCameraDto {
  name?: string;
  description?: string;
  rtspUrl?: string;
}

export interface CameraStreamInfo {
  cameraId: string;
  streamUrl: string;
  type: 'mjpeg' | 'hls' | 'jpeg';
}
