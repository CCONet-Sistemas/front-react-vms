import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useMe } from '~/hooks/useMe';
import { useTheme } from '~/hooks/useTheme';
import { wsManager } from '~/services/websocket';

export function MainLayout() {
  // Initialize theme and fetch user data on mount
  useTheme();
  useMe();

  // Initialize WebSocket connection
  // Note: disconnect is handled by logout in useAuth, not here
  // This avoids issues with React Strict Mode double-mounting
  useEffect(() => {
    wsManager.connect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      {/* Main content area */}
      <main className="lg:pl-64 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
