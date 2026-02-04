import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotificationType } from '~/types/notification.types';

export type SoundSeverity = 'low' | 'medium' | 'high' | 'critical';

// Detection types from camera events
export type EventDetectionType =
  | 'motion'
  | 'tampering'
  | 'line_crossing'
  | 'intrusion'
  | 'face_recognition';

export interface NotificationTypeSettings {
  toastEnabled: boolean;
  soundEnabled: boolean;
  soundSeverity: SoundSeverity;
}

// Settings for each detection type
export interface DetectionTypeSettings extends NotificationTypeSettings {
  enabled: boolean; // Master toggle for this detection type
}

// When to notify about camera events
export type EventNotifyTiming = 'detection' | 'video_ready' | 'both' | 'never';

// Camera-specific overrides
export interface CameraNotificationOverride {
  enabled: boolean; // Whether to use custom settings for this camera
  detectionSettings?: Partial<Record<EventDetectionType, Partial<DetectionTypeSettings>>>;
}

interface NotificationPreferencesState {
  // Global settings
  toastsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0-100

  // When to notify about camera events
  eventNotifyTiming: EventNotifyTiming;

  // Per notification type settings (info, success, warning, error, event)
  typeSettings: Record<NotificationType, NotificationTypeSettings>;

  // Granular event detection settings
  detectionSettings: Record<EventDetectionType, DetectionTypeSettings>;

  // Per-camera overrides (cameraUuid -> settings)
  cameraOverrides: Record<string, CameraNotificationOverride>;
}

interface NotificationPreferencesActions {
  setToastsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setEventNotifyTiming: (timing: EventNotifyTiming) => void;
  setTypeSettings: (type: NotificationType, settings: Partial<NotificationTypeSettings>) => void;
  setDetectionSettings: (
    detection: EventDetectionType,
    settings: Partial<DetectionTypeSettings>
  ) => void;
  setCameraOverride: (cameraUuid: string, override: Partial<CameraNotificationOverride>) => void;
  setCameraDetectionOverride: (
    cameraUuid: string,
    detection: EventDetectionType,
    settings: Partial<DetectionTypeSettings>
  ) => void;
  removeCameraOverride: (cameraUuid: string) => void;
  resetToDefaults: () => void;
}

const defaultTypeSettings: Record<NotificationType, NotificationTypeSettings> = {
  info: {
    toastEnabled: true,
    soundEnabled: false,
    soundSeverity: 'low',
  },
  success: {
    toastEnabled: true,
    soundEnabled: false,
    soundSeverity: 'low',
  },
  warning: {
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'medium',
  },
  error: {
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'high',
  },
  event: {
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'critical',
  },
};

const defaultDetectionSettings: Record<EventDetectionType, DetectionTypeSettings> = {
  motion: {
    enabled: true,
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'medium',
  },
  tampering: {
    enabled: true,
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'critical',
  },
  line_crossing: {
    enabled: true,
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'high',
  },
  intrusion: {
    enabled: true,
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'critical',
  },
  face_recognition: {
    enabled: true,
    toastEnabled: true,
    soundEnabled: true,
    soundSeverity: 'high',
  },
};

const initialState: NotificationPreferencesState = {
  toastsEnabled: true,
  soundEnabled: true,
  soundVolume: 50,
  eventNotifyTiming: 'video_ready',
  typeSettings: defaultTypeSettings,
  detectionSettings: defaultDetectionSettings,
  cameraOverrides: {},
};

export const useNotificationPreferencesStore = create<
  NotificationPreferencesState & NotificationPreferencesActions
>()(
  persist(
    (set) => ({
      ...initialState,

      setToastsEnabled: (enabled) => set({ toastsEnabled: enabled }),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(100, volume)) }),

      setEventNotifyTiming: (timing) => set({ eventNotifyTiming: timing }),

      setTypeSettings: (type, settings) =>
        set((state) => ({
          typeSettings: {
            ...state.typeSettings,
            [type]: {
              ...state.typeSettings[type],
              ...settings,
            },
          },
        })),

      setDetectionSettings: (detection, settings) =>
        set((state) => ({
          detectionSettings: {
            ...state.detectionSettings,
            [detection]: {
              ...state.detectionSettings[detection],
              ...settings,
            },
          },
        })),

      setCameraOverride: (cameraUuid, override) =>
        set((state) => ({
          cameraOverrides: {
            ...state.cameraOverrides,
            [cameraUuid]: {
              ...state.cameraOverrides[cameraUuid],
              ...override,
            },
          },
        })),

      setCameraDetectionOverride: (cameraUuid, detection, settings) =>
        set((state) => {
          const currentOverride = state.cameraOverrides[cameraUuid] || { enabled: true };
          return {
            cameraOverrides: {
              ...state.cameraOverrides,
              [cameraUuid]: {
                ...currentOverride,
                detectionSettings: {
                  ...currentOverride.detectionSettings,
                  [detection]: {
                    ...currentOverride.detectionSettings?.[detection],
                    ...settings,
                  },
                },
              },
            },
          };
        }),

      removeCameraOverride: (cameraUuid) =>
        set((state) => {
          const { [cameraUuid]: _, ...rest } = state.cameraOverrides;
          return { cameraOverrides: rest };
        }),

      resetToDefaults: () => set(initialState),
    }),
    {
      name: 'notification-preferences-storage',
    }
  )
);

// Selectors
export const selectToastsEnabled = (
  state: NotificationPreferencesState & NotificationPreferencesActions
) => state.toastsEnabled;

export const selectSoundEnabled = (
  state: NotificationPreferencesState & NotificationPreferencesActions
) => state.soundEnabled;

export const selectSoundVolume = (
  state: NotificationPreferencesState & NotificationPreferencesActions
) => state.soundVolume;

export const selectTypeSettings = (
  state: NotificationPreferencesState & NotificationPreferencesActions
) => state.typeSettings;

export const selectTypeSettingsFor =
  (type: NotificationType) =>
  (state: NotificationPreferencesState & NotificationPreferencesActions) =>
    state.typeSettings[type];

export const selectDetectionSettings = (
  state: NotificationPreferencesState & NotificationPreferencesActions
) => state.detectionSettings;

export const selectDetectionSettingsFor =
  (detection: EventDetectionType) =>
  (state: NotificationPreferencesState & NotificationPreferencesActions) =>
    state.detectionSettings[detection];

export const selectCameraOverrides = (
  state: NotificationPreferencesState & NotificationPreferencesActions
) => state.cameraOverrides;

export const selectCameraOverrideFor =
  (cameraUuid: string) => (state: NotificationPreferencesState & NotificationPreferencesActions) =>
    state.cameraOverrides[cameraUuid];

// Helper to get effective settings for a detection type on a specific camera
export const getEffectiveDetectionSettings = (
  state: NotificationPreferencesState & NotificationPreferencesActions,
  cameraUuid: string,
  detection: EventDetectionType
): DetectionTypeSettings => {
  const globalSettings = state.detectionSettings[detection];
  const cameraOverride = state.cameraOverrides[cameraUuid];

  if (!cameraOverride?.enabled || !cameraOverride.detectionSettings?.[detection]) {
    return globalSettings;
  }

  return {
    ...globalSettings,
    ...cameraOverride.detectionSettings[detection],
  };
};
