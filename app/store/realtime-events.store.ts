import { create } from 'zustand';
import type { Event } from '~/types/event.types';

const MAX_RECENT_EVENTS = 50;

interface RealtimeEventsState {
  recentEvents: Event[];
  unreadCount: number;
  hasNewEvents: boolean;
}

interface RealtimeEventsActions {
  addEvent: (event: Event) => void;
  updateEvent: (uuid: string, updates: Partial<Event>) => void;
  markAsRead: (uuid: string) => void;
  markAllAsRead: () => void;
  clearRecentEvents: () => void;
  setHasNewEvents: (value: boolean) => void;
}

const initialState: RealtimeEventsState = {
  recentEvents: [],
  unreadCount: 0,
  hasNewEvents: false,
};

export const useRealtimeEventsStore = create<RealtimeEventsState & RealtimeEventsActions>()(
  (set) => ({
    ...initialState,

    addEvent: (event) =>
      set((state) => {
        // Avoid duplicates
        if (state.recentEvents.some((e) => e.uuid === event.uuid)) {
          return state;
        }

        const newEvents = [event, ...state.recentEvents].slice(0, MAX_RECENT_EVENTS);
        const unreadCount = event.status === 'new' ? state.unreadCount + 1 : state.unreadCount;

        return {
          recentEvents: newEvents,
          unreadCount,
          hasNewEvents: true,
        };
      }),

    updateEvent: (uuid, updates) =>
      set((state) => {
        const eventIndex = state.recentEvents.findIndex((e) => e.uuid === uuid);
        if (eventIndex === -1) return state;

        const updatedEvents = [...state.recentEvents];
        const oldEvent = updatedEvents[eventIndex];
        updatedEvents[eventIndex] = { ...oldEvent, ...updates };

        // Adjust unread count if status changed
        let unreadCount = state.unreadCount;
        if (updates.status && oldEvent.status === 'new' && updates.status !== 'new') {
          unreadCount = Math.max(0, unreadCount - 1);
        }

        return {
          recentEvents: updatedEvents,
          unreadCount,
        };
      }),

    markAsRead: (uuid) =>
      set((state) => {
        const eventIndex = state.recentEvents.findIndex((e) => e.uuid === uuid);
        if (eventIndex === -1) return state;

        const event = state.recentEvents[eventIndex];
        if (event.status !== 'new') return state;

        const updatedEvents = [...state.recentEvents];
        updatedEvents[eventIndex] = { ...event, status: 'viewed' };

        return {
          recentEvents: updatedEvents,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }),

    markAllAsRead: () =>
      set((state) => ({
        recentEvents: state.recentEvents.map((event) =>
          event.status === 'new' ? { ...event, status: 'viewed' } : event
        ),
        unreadCount: 0,
        hasNewEvents: false,
      })),

    clearRecentEvents: () => set(initialState),

    setHasNewEvents: (value) => set({ hasNewEvents: value }),
  })
);

// Atomic selectors
export const selectRecentEvents = (state: RealtimeEventsState & RealtimeEventsActions) =>
  state.recentEvents;

export const selectUnreadCount = (state: RealtimeEventsState & RealtimeEventsActions) =>
  state.unreadCount;

export const selectHasNewEvents = (state: RealtimeEventsState & RealtimeEventsActions) =>
  state.hasNewEvents;

export const selectEventByUuid = (uuid: string) => (state: RealtimeEventsState & RealtimeEventsActions) =>
  state.recentEvents.find((e) => e.uuid === uuid);
