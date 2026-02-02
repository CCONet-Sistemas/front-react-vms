import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '~/store/auth.store';
import { useWebSocketStore } from '~/store/websocket.store';
import { WS_CONFIG } from './constants';
import type { WebSocketStatus, WebSocketEventHandler } from './types';

class WebSocketManager {
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private debug = false;

  connect(): void {
    if (this.socket?.connected) {
      this.log('info', 'Already connected');
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      this.log('warn', 'No auth token available');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      this.log('error', 'VITE_WS_URL not configured');
      this.updateStatus('error');
      this.setError('WebSocket URL not configured');
      return;
    }

    this.updateStatus('connecting');
    this.log('info', 'Connecting to Socket.IO', { url: wsUrl });

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: WS_CONFIG.RECONNECT_INTERVAL,
      reconnectionDelayMax: WS_CONFIG.MAX_BACKOFF,
      timeout: 20000,
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    this.log('info', 'Disconnecting Socket.IO');

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateStatus('disconnected');
    useWebSocketStore.getState().reset();
  }

  getStatus(): WebSocketStatus {
    return useWebSocketStore.getState().status;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  subscribe<T = unknown>(
    event: string,
    handler: WebSocketEventHandler<T>
  ): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(handler as WebSocketEventHandler);

    // Register with Socket.IO if connected
    if (this.socket) {
      this.socket.on(event, handler as WebSocketEventHandler);
    }

    this.log('info', `Subscribed to event: ${event}`);
    return () => this.unsubscribe(event, handler);
  }

  unsubscribe<T = unknown>(
    event: string,
    handler: WebSocketEventHandler<T>
  ): void {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      handlers.delete(handler as WebSocketEventHandler);
      if (handlers.size === 0) {
        this.subscribers.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, handler as WebSocketEventHandler);
    }

    this.log('info', `Unsubscribed from event: ${event}`);
  }

  emit<T = unknown>(event: string, data: T): void {
    if (!this.isConnected()) {
      this.log('warn', 'Cannot emit: not connected');
      return;
    }

    this.socket!.emit(event, data);
    this.log('info', `Emitted event: ${event}`, data);
  }

  enableDebug(): void {
    this.debug = true;
    this.log('info', 'Debug mode enabled');
  }

  disableDebug(): void {
    this.log('info', 'Debug mode disabled');
    this.debug = false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.log('info', 'Socket.IO connected', { id: this.socket?.id });
      this.updateStatus('connected');
      this.setError(null);
      useWebSocketStore.getState().setLastConnectedAt(new Date());
      useWebSocketStore.getState().resetReconnectAttempts();

      // Re-register all subscribers
      this.subscribers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.socket?.on(event, handler);
        });
      });

      this.dispatch('connect', { id: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.log('info', 'Socket.IO disconnected', { reason });
      this.dispatch('disconnect', { reason });

      if (reason === 'io server disconnect') {
        // Server disconnected, need manual reconnect
        this.updateStatus('disconnected');
      } else {
        // Client disconnect or transport error, Socket.IO will auto-reconnect
        this.updateStatus('reconnecting');
      }
    });

    this.socket.on('connect_error', (error) => {
      this.log('error', 'Socket.IO connection error', error.message);
      this.updateStatus('error');
      this.setError(error.message);
      useWebSocketStore.getState().incrementReconnectAttempts();
      this.dispatch('error', { message: error.message });
    });

    this.socket.io.on('reconnect', (attempt) => {
      this.log('info', 'Socket.IO reconnected', { attempt });
      useWebSocketStore.getState().resetReconnectAttempts();
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      this.log('info', 'Socket.IO reconnecting...', { attempt });
      this.updateStatus('reconnecting');
      useWebSocketStore.getState().incrementReconnectAttempts();
    });

    this.socket.io.on('reconnect_failed', () => {
      this.log('error', 'Socket.IO reconnection failed');
      this.updateStatus('error');
      this.setError('Unable to connect to server');
    });
  }

  private dispatch(event: string, data: unknown): void {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          this.log('error', `Handler error for event: ${event}`, error);
        }
      });
    }
  }

  private updateStatus(status: WebSocketStatus): void {
    useWebSocketStore.getState().setStatus(status);
  }

  private setError(error: string | null): void {
    useWebSocketStore.getState().setError(error);
  }

  private log(
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: unknown
  ): void {
    if (!this.debug) return;

    const prefix = `[Socket.IO ${new Date().toISOString()}]`;
    const formattedMessage = `${prefix} ${message}`;

    if (level === 'error') {
      if (data !== undefined) {
        console.error(formattedMessage, data);
      } else {
        console.error(formattedMessage);
      }
    } else {
      if (data !== undefined) {
        console.warn(formattedMessage, data);
      } else {
        console.warn(formattedMessage);
      }
    }
  }
}

export const wsManager = new WebSocketManager();
export { WebSocketManager };
