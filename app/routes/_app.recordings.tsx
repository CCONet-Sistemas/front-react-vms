import type { Route } from './+types/_app.recordings';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Film } from 'lucide-react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Recordings | VMS' },
    { name: 'description', content: 'View recordings - Video Management System' },
  ];
}

export default function RecordingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
        <p className="text-muted-foreground">
          Browse and playback recorded footage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recording Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No recordings found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Recordings will appear here once cameras start recording
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
