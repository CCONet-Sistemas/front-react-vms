import type { Route } from './+types/dashboard';
import { redirect } from 'react-router';
import { useAuthStore } from '~/store';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard | VMS' },
    { name: 'description', content: 'VMS Dashboard - Video Management System' },
  ];
}

export function clientLoader() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) {
    return redirect('/login');
  }
  return null;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.name || 'User'}!</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold">Cameras</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold">Online</h3>
            <p className="text-2xl font-bold mt-2 text-green-500">0</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold">Offline</h3>
            <p className="text-2xl font-bold mt-2 text-red-500">0</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold">Events Today</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
