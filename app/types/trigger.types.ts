export interface CameraTrigger {
  id?: number;
  cameraId: string;
  webhookEnabled?: boolean;
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT';
  emailEnabled?: boolean;
  emailTimeout?: number;
  sendEmail?: string;
  commandEnabled?: boolean;
  commandPath?: string;
  commandTimeout?: number;
  recordingEnabled?: boolean;
  saveEvents?: boolean;
  videoLength?: number;
  snapSecondsInward?: number;
  detectorHttpApi?: string;
  detectorSave?: boolean;
  useDetectorFiltersObject?: boolean;
  watchdogReset?: boolean;
  detectorTriggerTags?: string;
  inverseTrigger?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTriggerDto = Omit<CameraTrigger, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTriggerDto = Partial<CreateTriggerDto> & { cameraId: string };
