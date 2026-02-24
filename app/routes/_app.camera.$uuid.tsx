import { useCamera } from '~/features/cameras';
import type { Route } from '../+types/root';
import CameraForm from '~/features/camera/components/cameraForm';
import type { StreamState } from '~/types';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { streamStatusConfig } from '~/features/cameras/constants';
import { RecordingControlPanel } from '~/features/recordings';
import { DetectionForm } from '~/features/detections';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Settings, Video, ScanSearch } from 'lucide-react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Editar Câmera | VMS' },
    { name: 'description', content: 'Editar câmera - Video Management System' },
  ];
}

export default function EditCameraPage({ params }: Route.ComponentProps) {
  const { uuid } = params;
  if (!uuid) {
    return <div>Câmera não encontrada</div>;
  }

  const cameraResult = useCamera(uuid);

  if (!cameraResult.error && !cameraResult.data) {
    return <div>Câmera não encontrada</div>;
  }

  const camera = cameraResult.data;
  const streamState = camera?.streamStatus
    ? (camera?.streamStatus.state as StreamState)
    : 'created';
  const status = streamStatusConfig[streamState] ?? streamStatusConfig.stopped;

  return (
    <ProtectedRoute resource="camera" action="read">
      <PageContent variant="form">
        <PageHeader
          title="Editar câmera"
          description="Atualize as configurações da câmera"
          status={status}
        />

        {camera ? (
          <Tabs defaultValue="config">
            <TabsList>
              <TabsTrigger value="config" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="recording" className="gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Gravação
              </TabsTrigger>
              <TabsTrigger value="detection" className="gap-1.5">
                <ScanSearch className="h-3.5 w-3.5" />
                Detecções
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <CameraForm camera={camera} />
            </TabsContent>

            <TabsContent value="recording">
              <RecordingControlPanel cameraId={uuid} camera={camera} />
            </TabsContent>

            <TabsContent value="detection">
              <DetectionForm cameraId={uuid} camera={camera} />
            </TabsContent>
          </Tabs>
        ) : (
          <CameraForm />
        )}
      </PageContent>
    </ProtectedRoute>
  );
}
