import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toaster } from '~/components/ui/sonner';
import { CommandPalette } from '~/components/common';
import { useMe } from '~/hooks/useMe';
import { useTheme } from '~/hooks/useTheme';
import { useRealtimeSync } from '~/hooks/useRealtimeSync';
import { useNotificationToasts } from '~/hooks/useNotificationToasts';
import { wsManager } from '~/services/websocket';
import { useUIStore } from '~/store';
import { cn } from '~/lib/utils';

export function MainLayout() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  // Initialize theme and fetch user data on mount
  useTheme();
  useMe();

  // Initialize WebSocket connection
  // Note: disconnect is handled by logout in useAuth, not here
  // This avoids issues with React Strict Mode double-mounting
  useEffect(() => {
    wsManager.connect();
  }, []);

  // Sync WebSocket events to stores and query cache
  useRealtimeSync();

  // Handle notification toasts and sounds
  useNotificationToasts();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      {/* Main content area */}
      <main className={cn(
        'pt-16 transition-[padding] duration-300 ease-in-out',
        'lg:pl-[78px]',
        !sidebarCollapsed && 'lg:pl-80'
      )}>
        <Outlet />
      </main>

      {/* Toast notifications */}
      <Toaster />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
