import { useEffect, useCallback, useRef } from 'react';
import { useWebSocketStore } from '~/store/websocket.store';
import { wsManager } from '~/services/websocket';
import type { WebSocketEventHandler } from '~/services/websocket/types';

export function useWebSocket() {
  const status = useWebSocketStore((s) => s.status);
  const error = useWebSocketStore((s) => s.error);
  const reconnectAttempts = useWebSocketStore((s) => s.reconnectAttempts);
  const lastConnectedAt = useWebSocketStore((s) => s.lastConnectedAt);

  const connect = useCallback(() => {
    wsManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  return {
    status,
    error,
    reconnectAttempts,
    lastConnectedAt,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isReconnecting: status === 'reconnecting',
    connect,
    disconnect,
  };
}

export function useWebSocketEvent<T = unknown>(
  event: string,
  handler: WebSocketEventHandler<T>
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler: WebSocketEventHandler<T> = (data) => {
      handlerRef.current(data);
    };

    const unsubscribe = wsManager.subscribe<T>(event, wrappedHandler);

    return () => {
      unsubscribe();
    };
  }, [event]);
}
