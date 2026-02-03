import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  useNotificationsStore,
  useNotificationPreferencesStore,
  getEffectiveDetectionSettings,
} from '~/store';
import { notificationSound } from '~/services/sound';
import type { Notification, NotificationType } from '~/types/notification.types';
import type {
  SoundSeverity,
  EventDetectionType,
  DetectionTypeSettings,
} from '~/store/notification-preferences.store';

const TOAST_TYPE_MAP: Record<NotificationType, 'info' | 'success' | 'warning' | 'error'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  event: 'info',
};

// Map detection reasons to detection types
const DETECTION_TYPE_MAP: Record<string, EventDetectionType> = {
  motion: 'motion',
  'detecção de movimento': 'motion',
  tampering: 'tampering',
  'violação de câmera': 'tampering',
  line_crossing: 'line_crossing',
  'cruzamento de linha': 'line_crossing',
  intrusion: 'intrusion',
  'intrusão': 'intrusion',
  face_recognition: 'face_recognition',
  'reconhecimento facial': 'face_recognition',
};

// Extract detection type from notification title
function extractDetectionType(title: string): EventDetectionType | null {
  const lowerTitle = title.toLowerCase();
  for (const [key, value] of Object.entries(DETECTION_TYPE_MAP)) {
    if (lowerTitle.includes(key)) {
      return value;
    }
  }
  return null;
}

export function useNotificationToasts() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const lastProcessedIdRef = useRef<string | null>(null);
  const audioUnlockedRef = useRef(false);

  // Get preferences
  const toastsEnabled = useNotificationPreferencesStore((state) => state.toastsEnabled);
  const soundEnabled = useNotificationPreferencesStore((state) => state.soundEnabled);
  const soundVolume = useNotificationPreferencesStore((state) => state.soundVolume);
  const typeSettings = useNotificationPreferencesStore((state) => state.typeSettings);
  const preferencesState = useNotificationPreferencesStore((state) => state);

  // Unlock audio on first user interaction
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    notificationSound.unlockAudio();
    audioUnlockedRef.current = true;
  }, []);

  // Set up audio unlock listeners
  useEffect(() => {
    const events = ['click', 'touchstart', 'keydown'];

    const handleInteraction = () => {
      unlockAudio();
      // Remove listeners after first interaction
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [unlockAudio]);

  // Show toast for notification
  const showToast = useCallback(
    (notification: Notification) => {
      const toastType = TOAST_TYPE_MAP[notification.type];

      toast[toastType](notification.title, {
        description: notification.message,
        id: notification.id,
        duration: notification.type === 'error' ? 6000 : 4000,
      });
    },
    []
  );

  // Play sound for notification
  const playSound = useCallback(
    (severity: SoundSeverity) => {
      notificationSound.play(severity, soundVolume);
    },
    [soundVolume]
  );

  // Get effective settings for a notification
  const getNotificationSettings = useCallback(
    (notification: Notification): { toastEnabled: boolean; soundEnabled: boolean; soundSeverity: SoundSeverity } => {
      // For non-event notifications, use type settings
      if (notification.type !== 'event') {
        const settings = typeSettings[notification.type];
        return {
          toastEnabled: settings.toastEnabled,
          soundEnabled: settings.soundEnabled,
          soundSeverity: settings.soundSeverity,
        };
      }

      // For event notifications, check detection type and camera overrides
      const detectionType = extractDetectionType(notification.title);
      const cameraUuid = notification.metadata?.cameraUuid;

      // If we can identify the detection type, use granular settings
      if (detectionType && cameraUuid) {
        const effectiveSettings = getEffectiveDetectionSettings(
          preferencesState,
          cameraUuid,
          detectionType
        );

        // If detection type is disabled, don't show anything
        if (!effectiveSettings.enabled) {
          return { toastEnabled: false, soundEnabled: false, soundSeverity: 'low' };
        }

        return {
          toastEnabled: effectiveSettings.toastEnabled,
          soundEnabled: effectiveSettings.soundEnabled,
          soundSeverity: effectiveSettings.soundSeverity,
        };
      }

      // If we can identify detection type but no camera, use global detection settings
      if (detectionType) {
        const detectionSettings = preferencesState.detectionSettings[detectionType];
        if (!detectionSettings.enabled) {
          return { toastEnabled: false, soundEnabled: false, soundSeverity: 'low' };
        }
        return {
          toastEnabled: detectionSettings.toastEnabled,
          soundEnabled: detectionSettings.soundEnabled,
          soundSeverity: detectionSettings.soundSeverity,
        };
      }

      // Fallback to generic event settings
      const settings = typeSettings.event;
      return {
        toastEnabled: settings.toastEnabled,
        soundEnabled: settings.soundEnabled,
        soundSeverity: settings.soundSeverity,
      };
    },
    [typeSettings, preferencesState]
  );

  // Process new notifications
  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[0];

    // Skip if we already processed this notification
    if (lastProcessedIdRef.current === latestNotification.id) return;

    // Skip if notification is already read (loaded from storage)
    if (latestNotification.read) {
      lastProcessedIdRef.current = latestNotification.id;
      return;
    }

    const settings = getNotificationSettings(latestNotification);

    // Show toast if enabled
    if (toastsEnabled && settings.toastEnabled) {
      showToast(latestNotification);
    }

    // Play sound if enabled
    if (soundEnabled && settings.soundEnabled) {
      playSound(settings.soundSeverity);
    }

    lastProcessedIdRef.current = latestNotification.id;
  }, [notifications, toastsEnabled, soundEnabled, getNotificationSettings, showToast, playSound]);
}
