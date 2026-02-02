export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000,
  BACKOFF_MULTIPLIER: 1.5,
  MAX_BACKOFF: 30000,
} as const;

export const WS_EVENTS = {
  // System
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  HEARTBEAT: 'ping',

  // Cameras
  CAMERA_STATUS: 'camera:status',
  CAMERA_SNAPSHOT: 'camera:snapshot',

  // Events
  EVENT_NEW: 'event:new',
  EVENT_UPDATE: 'event:update',

  // Notifications
  NOTIFICATION: 'notification',
} as const;
