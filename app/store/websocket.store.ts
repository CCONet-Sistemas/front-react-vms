import { create } from 'zustand';
import type { WebSocketStatus } from '~/services/websocket/types';

interface WebSocketState {
  status: WebSocketStatus;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;
  error: string | null;
}

interface WebSocketActions {
  setStatus: (status: WebSocketStatus) => void;
  setError: (error: string | null) => void;
  setLastConnectedAt: (date: Date | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  reset: () => void;
}

const initialState: WebSocketState = {
  status: 'disconnected',
  lastConnectedAt: null,
  reconnectAttempts: 0,
  error: null,
};

export const useWebSocketStore = create<WebSocketState & WebSocketActions>()(
  (set) => ({
    ...initialState,

    setStatus: (status) => set({ status }),

    setError: (error) => set({ error }),

    setLastConnectedAt: (date) => set({ lastConnectedAt: date }),

    incrementReconnectAttempts: () =>
      set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),

    resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

    reset: () => set(initialState),
  })
);
