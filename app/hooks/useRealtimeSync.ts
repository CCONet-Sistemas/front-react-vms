import { useCallback } from 'react';
import { useWebSocketEvent } from './useWebSocket';
import { useCameraStatusStore } from '~/store/camera-status.store';
import { useRealtimeEventsStore } from '~/store/realtime-events.store';
import { useNotificationsStore } from '~/store/notifications.store';
import { queryClient } from '~/root';
import { cameraKeys } from '~/features/cameras/hooks/useCameras';
import type {
  CameraEventPayload,
  DetectionEventPayload,
  NotificationPayload,
  VideoEventPayload,
  SystemEventPayload,
  SyncEventPayload,
} from '~/services/websocket/types';
import type { Event } from '~/types/event.types';
import type { Notification, NotificationType } from '~/types/notification.types';
import type { Camera, StreamStatus } from '~/types/camera.types';

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
        const event: Event = {
          uuid: data.eventUuid,
          cameraUuid: cameraId,
          cameraName: '', // Will be enriched by the query
          status: 'new',
          reason: data.reason ?? data.objectType ?? 'Detecção',
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

        // Create notification for the new event
        const notification: Notification = {
          id: `event-${event.uuid}`,
          type: 'event',
          title: `Evento: ${event.reason}`,
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
    },
    [addEvent, addNotification]
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
        const notification: Notification = {
          id: `event-${data.uuid}`,
          type: 'event',
          title: 'Evento disponível',
          message: `Câmera ${cameraId}`,
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
    },
    [addNotification]
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
}
