import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '~/types/notification.types';

const MAX_NOTIFICATIONS = 100;

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationsActions {
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
  persist(
    (set) => ({
      ...initialState,

      addNotification: (notification) =>
        set((state) => {
          // Avoid duplicates
          if (state.notifications.some((n) => n.id === notification.id)) {
            return state;
          }

          const newNotifications = [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
          const unreadCount = !notification.read ? state.unreadCount + 1 : state.unreadCount;

          return {
            notifications: newNotifications,
            unreadCount,
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          const notificationIndex = state.notifications.findIndex((n) => n.id === id);
          if (notificationIndex === -1) return state;

          const notification = state.notifications[notificationIndex];
          if (notification.read) return state;

          const updatedNotifications = [...state.notifications];
          updatedNotifications[notificationIndex] = { ...notification, read: true };

          return {
            notifications: updatedNotifications,
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification) return state;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      clearAll: () => set(initialState),
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Persist only last 50
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Atomic selectors
export const selectNotifications = (state: NotificationsState & NotificationsActions) =>
  state.notifications;

export const selectUnreadNotificationCount = (state: NotificationsState & NotificationsActions) =>
  state.unreadCount;

export const selectNotificationById = (id: string) => (state: NotificationsState & NotificationsActions) =>
  state.notifications.find((n) => n.id === id);

export const selectUnreadNotifications = (state: NotificationsState & NotificationsActions) =>
  state.notifications.filter((n) => !n.read);
