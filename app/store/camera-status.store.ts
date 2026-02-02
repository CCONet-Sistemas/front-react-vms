import { create } from 'zustand';
import type { StreamStatus } from '~/types/camera.types';

interface CameraStatusState {
  statuses: Record<string, StreamStatus>;
}

interface CameraStatusActions {
  updateStatus: (uuid: string, status: StreamStatus) => void;
  updateMultiple: (updates: Record<string, StreamStatus>) => void;
  removeStatus: (uuid: string) => void;
  clearAll: () => void;
}

const initialState: CameraStatusState = {
  statuses: {},
};

export const useCameraStatusStore = create<CameraStatusState & CameraStatusActions>()(
  (set) => ({
    ...initialState,

    updateStatus: (uuid, status) =>
      set((state) => ({
        statuses: {
          ...state.statuses,
          [uuid]: status,
        },
      })),

    updateMultiple: (updates) =>
      set((state) => ({
        statuses: {
          ...state.statuses,
          ...updates,
        },
      })),

    removeStatus: (uuid) =>
      set((state) => {
        const { [uuid]: _, ...rest } = state.statuses;
        return { statuses: rest };
      }),

    clearAll: () => set(initialState),
  })
);

// Atomic selectors to avoid unnecessary re-renders
export const selectCameraStatus = (uuid: string) => (state: CameraStatusState & CameraStatusActions) =>
  state.statuses[uuid];

export const selectAllCameraStatuses = (state: CameraStatusState & CameraStatusActions) =>
  state.statuses;

export const selectCameraIsHealthy = (uuid: string) => (state: CameraStatusState & CameraStatusActions) =>
  state.statuses[uuid]?.isHealthy ?? false;

export const selectCameraState = (uuid: string) => (state: CameraStatusState & CameraStatusActions) =>
  state.statuses[uuid]?.state ?? 'offline';
