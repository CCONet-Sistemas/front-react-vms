import type { Route } from './+types/_app.events';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Bell } from 'lucide-react';
import { ProtectedRoute } from '~/components/common';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Events | VMS' },
    { name: 'description', content: 'View events - Video Management System' },
  ];
}

export default function EventsPage() {
  return (
    <ProtectedRoute resource='event' action='read'>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          View motion detection and system events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No events recorded</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Events will appear here as they occur
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
