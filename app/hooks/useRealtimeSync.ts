import { useCallback } from 'react';
import { useWebSocketEvent } from './useWebSocket';
import { useCameraStatusStore } from '~/store/camera-status.store';
import { useRealtimeEventsStore } from '~/store/realtime-events.store';
import { useNotificationsStore } from '~/store/notifications.store';
import {
  useNotificationPreferencesStore,
  getEffectiveDetectionSettings,
} from '~/store/notification-preferences.store';
import type { EventDetectionType } from '~/store/notification-preferences.store';
import { queryClient } from '~/root';
import { cameraKeys } from '~/features/cameras/hooks/useCameras';
import type {
  CameraEventPayload,
  DetectionEventPayload,
  NotificationPayload,
  VideoEventPayload,
  SystemEventPayload,
  SyncEventPayload,
  RecordingStatusPayload,
} from '~/services/websocket/types';
import type { Event } from '~/types/event.types';
import type { Notification, NotificationType } from '~/types/notification.types';
import type { Camera, StreamStatus } from '~/types/camera.types';
import type { RecordingControlStatus } from '~/types/recordings.types';
import { recordingControlKeys } from '~/features/recordings/hooks/useRecordingControls';

// Map detection reasons to detection types
const DETECTION_TYPE_MAP: Record<string, EventDetectionType> = {
  motion: 'motion',
  'detecção de movimento': 'motion',
  tampering: 'tampering',
  'violação de câmera': 'tampering',
  line_crossing: 'line_crossing',
  'cruzamento de linha': 'line_crossing',
  intrusion: 'intrusion',
  intrusão: 'intrusion',
  face_recognition: 'face_recognition',
  'reconhecimento facial': 'face_recognition',
};

// Extract detection type from reason string
function extractDetectionType(reason: string): EventDetectionType | null {
  const lowerReason = reason.toLowerCase();
  for (const [key, value] of Object.entries(DETECTION_TYPE_MAP)) {
    if (lowerReason.includes(key)) {
      return value;
    }
  }
  return null;
}

// Map notification severity to notification type
const severityToType: Record<string, NotificationType> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  critical: 'error',
};

export function useRealtimeSync() {
  const updateCameraStatus = useCameraStatusStore((s) => s.updateStatus);
  const addEvent = useRealtimeEventsStore((s) => s.addEvent);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  // Get notification preferences
  const eventNotifyTiming = useNotificationPreferencesStore((s) => s.eventNotifyTiming);
  const preferencesState = useNotificationPreferencesStore((s) => s);

  // Helper to check if notification should be created based on detection settings
  const shouldNotifyDetection = useCallback(
    (reason: string, cameraId: string): boolean => {
      const detectionType = extractDetectionType(reason);
      if (!detectionType) {
        // Unknown detection type, allow notification
        return true;
      }

      const effectiveSettings = getEffectiveDetectionSettings(
        preferencesState,
        cameraId,
        detectionType
      );

      return effectiveSettings.enabled;
    },
    [preferencesState]
  );

  // Handle camera events (status, started, stopped, etc.)
  const handleCameraEvent = useCallback(
    (payload: CameraEventPayload) => {
      const { cameraId, type, data } = payload;

      if (type === 'camera:status' && data.state) {
        const streamStatus: StreamStatus = {
          state: data.state,
          isHealthy: data.isHealthy ?? false,
          fps: data.fps ?? '0',
          bitrate: data.bitrate ?? 0,
          resolutionWidth: data.resolutionWidth ?? 0,
          resolutionHeight: data.resolutionHeight ?? 0,
          latencyMs: data.latencyMs ?? null,
          lastFrameAt: data.lastFrameAt ?? null,
          lastHealthCheckAt: data.lastHealthCheckAt ?? null,
          retryCount: data.retryCount ?? 0,
          lastError: data.lastError ?? null,
          startedAt: data.startedAt ?? null,
          stoppedAt: data.stoppedAt ?? null,
        };

        // Update Zustand store
        updateCameraStatus(cameraId, streamStatus);

        // Update TanStack Query cache for instant UI update
        queryClient.setQueryData<StreamStatus>(cameraKeys.status(cameraId), streamStatus);

        // Also update the camera detail if cached
        queryClient.setQueryData<Camera>(cameraKeys.detail(cameraId), (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            streamStatus,
          };
        });
      }

      // Handle other camera events (edited, deleted, started, stopped)
      if (type === 'camera:edited' || type === 'camera:deleted') {
        queryClient.invalidateQueries({
          queryKey: cameraKeys.detail(cameraId),
          refetchType: 'none',
        });
        queryClient.invalidateQueries({
          queryKey: cameraKeys.lists(),
          refetchType: 'none',
        });
      }
    },
    [updateCameraStatus]
  );

  // Handle detection events (event:detected, motion:detected, etc.)
  const handleDetectionEvent = useCallback(
    (payload: DetectionEventPayload) => {
      const { cameraId, type, timestamp, data } = payload;

      if (type === 'event:detected' && data.eventUuid) {
        const reason = data.reason ?? data.objectType ?? 'Detecção';

        const event: Event = {
          uuid: data.eventUuid,
          cameraUuid: cameraId,
          cameraName: '', // Will be enriched by the query
          status: 'new',
          reason,
          confidence: data.confidence ?? 0,
          timestamp,
          videos: [],
          createdAt: timestamp,
        };

        // Add to realtime events store
        addEvent(event);

        // Invalidate events list queries (mark as stale without immediate refetch)
        queryClient.invalidateQueries({
          queryKey: ['events'],
          refetchType: 'none',
        });

        // Check if we should notify on detection based on eventNotifyTiming
        const shouldNotifyOnDetection =
          eventNotifyTiming === 'detection' || eventNotifyTiming === 'both';

        // Check if this detection type is enabled for this camera
        const isDetectionEnabled = shouldNotifyDetection(reason, cameraId);

        // Only create notification if timing and detection settings allow
        if (shouldNotifyOnDetection && isDetectionEnabled) {
          const notification: Notification = {
            id: `event-${event.uuid}`,
            type: 'event',
            title: `Evento: ${reason}`,
            message: `Câmera: ${cameraId}`,
            timestamp,
            read: false,
            metadata: {
              eventUuid: event.uuid,
              cameraUuid: cameraId,
              actionUrl: `/event/${event.uuid}`,
            },
          };

          addNotification(notification);
        }
      }
    },
    [addEvent, addNotification, eventNotifyTiming, shouldNotifyDetection]
  );

  // Handle video events
  const handleVideoEvent = useCallback(
    (payload: VideoEventPayload) => {
      const { cameraId, type, timestamp, data } = payload;

      // Invalidate related queries when video events occur
      if (type === 'video:completed' || type === 'video:deleted') {
        queryClient.invalidateQueries({
          queryKey: ['events'],
          refetchType: 'none',
        });
        queryClient.invalidateQueries({
          queryKey: ['videos', cameraId],
          refetchType: 'none',
        });
      }

      // Event is now ready (video downloaded, status changed from pending to new)
      if (type === 'video:completed' && data.uuid) {
        // Check if we should notify on video_ready based on eventNotifyTiming
        const shouldNotifyOnVideoReady =
          eventNotifyTiming === 'video_ready' || eventNotifyTiming === 'both';

        if (shouldNotifyOnVideoReady) {
          const notification: Notification = {
            id: `video-ready-${data.uuid}`,
            type: 'event',
            title: 'Evento disponível',
            message: `Evento de câmera está pronto para visualização.`,
            timestamp,
            read: false,
            metadata: {
              eventUuid: data.uuid,
              cameraUuid: cameraId,
              actionUrl: `/event/${data.uuid}`,
            },
          };

          addNotification(notification);
        }
      }
    },
    [addNotification, eventNotifyTiming]
  );

  // Handle system events
  const handleSystemEvent = useCallback((payload: SystemEventPayload) => {
    const { type, data } = payload;

    if (type === 'disk:usage' && data.diskUsage) {
      // Could update a system store here if needed
      queryClient.setQueryData(['system', 'disk'], data.diskUsage);
    }
  }, []);

  // Handle sync events
  const handleSyncEvent = useCallback(
    (payload: SyncEventPayload) => {
      const { cameraId, type, timestamp, data } = payload;

      let notification: Notification | null = null;

      switch (type) {
        case 'sync:started':
          notification = {
            id: `sync-started-${data.jobId}`,
            type: 'info',
            title: 'Sincronização iniciada',
            message: data.message ?? `Câmera ${cameraId}`,
            timestamp,
            read: false,
            metadata: { cameraUuid: cameraId },
          };
          break;

        case 'sync:completed':
          notification = {
            id: `sync-completed-${data.jobId}`,
            type: 'success',
            title: 'Sincronização concluída',
            message: data.message ?? `Câmera ${cameraId} - ${data.totalVideos ?? 0} vídeos`,
            timestamp,
            read: false,
            metadata: { cameraUuid: cameraId },
          };
          // Invalidate videos query
          queryClient.invalidateQueries({
            queryKey: ['videos', cameraId],
            refetchType: 'none',
          });
          break;

        case 'sync:failed':
          notification = {
            id: `sync-failed-${data.jobId}`,
            type: 'error',
            title: 'Sincronização falhou',
            message: data.message ?? data.error ?? `Câmera ${cameraId}`,
            timestamp,
            read: false,
            metadata: { cameraUuid: cameraId },
          };
          break;

        case 'sync:progress':
          // Progress events are too frequent for notifications
          // Could update a progress store here if needed
          break;
      }

      if (notification) {
        addNotification(notification);
      }
    },
    [addNotification]
  );

  // Handle recording status events
  const handleRecordingEvent = useCallback((payload: RecordingStatusPayload) => {
    const { cameraId, controlState } = payload;

    queryClient.setQueryData<RecordingControlStatus>(
      recordingControlKeys.status(cameraId),
      (prev) =>
        prev
          ? { ...prev, state: controlState, isRecording: controlState === 'recording', isPaused: false }
          : undefined
    );
  }, []);

  // Handle notifications from server
  const handleNotification = useCallback(
    (payload: NotificationPayload) => {
      const notification: Notification = {
        id: payload.uuid,
        type: severityToType[payload.severity] ?? 'info',
        title: payload.title,
        message: payload.message,
        timestamp: payload.timestamp,
        read: false,
        metadata: payload.data as Notification['metadata'],
      };

      addNotification(notification);
    },
    [addNotification]
  );

  // Subscribe to WebSocket events
  useWebSocketEvent<CameraEventPayload>('camera:event', handleCameraEvent);
  useWebSocketEvent<DetectionEventPayload>('detection:event', handleDetectionEvent);
  useWebSocketEvent<VideoEventPayload>('video:event', handleVideoEvent);
  useWebSocketEvent<SyncEventPayload>('sync:event', handleSyncEvent);
  useWebSocketEvent<SystemEventPayload>('system:event', handleSystemEvent);
  useWebSocketEvent<NotificationPayload>('notification:new', handleNotification);
  useWebSocketEvent<RecordingStatusPayload>('recording:status', handleRecordingEvent);
}
