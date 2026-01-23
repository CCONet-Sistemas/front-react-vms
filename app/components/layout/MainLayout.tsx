import { Outlet } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useMe } from '~/hooks/useMe';
import { useTheme } from '~/hooks/useTheme';

export function MainLayout() {
  // Initialize theme and fetch user data on mount
  useTheme();
  useMe();

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
