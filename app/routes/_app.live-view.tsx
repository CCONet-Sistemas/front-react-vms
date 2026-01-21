import type { Route } from './+types/_app.live-view';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Video } from 'lucide-react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Live View | VMS' },
    { name: 'description', content: 'Live camera view - Video Management System' },
  ];
}

export default function LiveViewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live View</h1>
        <p className="text-muted-foreground">
          Watch live camera feeds
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No live feeds available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add cameras to view live feeds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
