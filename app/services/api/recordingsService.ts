import type { RecordingAvailableRange, RecordingSessions, ExtractionRequest, ExtractionJob, RecordingControlStatus } from '~/types/recordings.types';
import { apiClient } from './client';

export interface SessionSegmentsParams {
  startDate?: string;
  endDate?: string;
}

export const recordingService = {
  getAvailableRange: async (uuid: string): Promise<RecordingAvailableRange> => {
    const { data } = await apiClient.get<RecordingAvailableRange>(
      `/recordings/${uuid}/available-range`
    );
    return data;
  },

  getSessionSegments: async (cameraId: string, params?: SessionSegmentsParams): Promise<RecordingSessions[]> => {
    const { data } = await apiClient.get<RecordingSessions[]>(`/recording/${cameraId}/sessions`, { params });
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
