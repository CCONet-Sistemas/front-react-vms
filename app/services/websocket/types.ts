export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
  timestamp?: string;
}

export interface WebSocketConfig {
  url: string;
  token?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

export type WebSocketEventHandler<T = unknown> = (data: T) => void;
