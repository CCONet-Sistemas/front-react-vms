import type { Route } from './+types/_app.cameras';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Plus, Camera } from 'lucide-react';
import { ProtectedRoute } from '~/components/common';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Cameras | VMS' },
    { name: 'description', content: 'Manage cameras - Video Management System' },
  ];
}

export default function CamerasPage() {
  return (
    <ProtectedRoute resource='camera' action='read'>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">
            Manage and configure your cameras
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No cameras configured</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first camera to get started
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Camera
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
