import type { RecordingAvailableRange, RecordingSessions, ExtractionRequest, ExtractionJob, RecordingControlStatus } from '~/types/recordings.types';
import { apiClient } from './client';

export interface SessionSegmentsMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface SessionSegmentsParams {
  start_date?: string;
  end_date?: string;
  status?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  select?: string;
}

export interface SessionSegmentsResult {
  data: RecordingSessions[];
  meta: SessionSegmentsMeta;
}

export const recordingService = {
  getAvailableRange: async (uuid: string): Promise<RecordingAvailableRange> => {
    const { data } = await apiClient.get<RecordingAvailableRange>(
      `/recordings/${uuid}/available-range`
    );
    return data;
  },

  getSessionSegments: async (cameraId: string, params?: SessionSegmentsParams): Promise<SessionSegmentsResult> => {
    const { data } = await apiClient.get<SessionSegmentsResult>(
      `/recording/${cameraId}/sessions`,
      { params }
    );
    return data;
  },

  extractRecording: async (cameraId: string, request: ExtractionRequest): Promise<ExtractionJob> => {
    const { data } = await apiClient.post<ExtractionJob>(`/recording/${cameraId}/extract`, request);
    return data;
  },

  getExtractionStatus: async (cameraId: string, jobId: string): Promise<ExtractionJob> => {
    const { data } = await apiClient.get<ExtractionJob>(`/recording/${cameraId}/extract/${jobId}`);
    return data;
  },

  downloadExtraction: async (cameraId: string, jobId: string): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`/recording/${cameraId}/extract/${jobId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  startRecording: async (cameraId: string): Promise<void> => {
    await apiClient.post(`/recording/${cameraId}/start`);
  },

  stopRecording: async (cameraId: string): Promise<void> => {
    await apiClient.post(`/recording/${cameraId}/stop`);
  },

  pauseRecording: async (cameraId: string): Promise<void> => {
    await apiClient.post(`/recording/${cameraId}/pause`);
  },

  resumeRecording: async (cameraId: string): Promise<void> => {
    await apiClient.post(`/recording/${cameraId}/resume`);
  },

  getStatus: async (cameraId: string): Promise<RecordingControlStatus> => {
    const { data } = await apiClient.get<RecordingControlStatus>(`/recording/${cameraId}/status`);
    return data;
  },
};
