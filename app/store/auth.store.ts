import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '~/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => {
        console.log('AuthStore.setUser called with:', user);
        set({ user, isAuthenticated: true });
      },

      setAccessToken: (accessToken) => {
        console.log('AuthStore.setAccessToken called');
        set({ accessToken });
      },

      login: (user, accessToken) => {
        console.log('AuthStore.login called with:', { user, accessToken: accessToken?.substring(0, 20) + '...' });
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'vms-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
