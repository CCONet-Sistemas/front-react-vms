import type { Route } from './+types/_app.dashboard';
import { useAuthStore } from '~/store';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Camera, Wifi, WifiOff, Bell } from 'lucide-react';
import { PageContent, PageHeader } from '~/components/common';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Dashboard | VMS' },
    { name: 'description', content: 'VMS Dashboard - Video Management System' },
  ];
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      title: 'Total Cameras',
      value: '0',
      icon: Camera,
      color: 'text-primary',
    },
    {
      title: 'Online',
      value: '0',
      icon: Wifi,
      color: 'text-green-500',
    },
    {
      title: 'Offline',
      value: '0',
      icon: WifiOff,
      color: 'text-destructive',
    },
    {
      title: 'Events Today',
      value: '0',
      icon: Bell,
      color: 'text-amber-500',
    },
  ];

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader title="Dashboard" description={`Bem vindo, ${user?.name || 'User'}!`} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No recent events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Server Status</span>
                  <span className="text-sm text-green-500 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage Used</span>
                  <span className="text-sm text-muted-foreground">0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Recordings</span>
                  <span className="text-sm text-muted-foreground">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
