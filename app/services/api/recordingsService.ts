import type { RecordingAvailableRange, RecordingSessions } from '~/types/recordings.types';
import { apiClient } from './client';

export const recordingService = {
  getAvailableRange: async (uuid: string): Promise<RecordingAvailableRange> => {
    const { data } = await apiClient.get<RecordingAvailableRange>(
      `/recordings/${uuid}/available-range`
    );
    return data;
  },

  getSessionSegments: async (cameraId: string): Promise<RecordingSessions[]> => {
    const { data } = await apiClient.get<RecordingSessions[]>(`/recording/${cameraId}/sessions`);
    return data;
  },
};
