import { Outlet } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTheme } from '~/hooks/useTheme';

export function MainLayout() {
  // Initialize theme on mount
  useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      {/* Main content area */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
