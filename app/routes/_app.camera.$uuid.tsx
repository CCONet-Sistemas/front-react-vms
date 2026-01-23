import { useCamera } from '~/features/cameras';
import type { Route } from '../+types/root';
import CameraForm from '~/features/camera/components/cameraForm';
import { Badge } from '~/components/ui/badge';
import type { StreamState } from '~/types';
import { PageContent, PageHeader } from '~/components/common';
import { streamStatusConfig } from '~/features/cameras/constants';

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
    <PageContent variant="form">
      <PageHeader
        title="Editar câmera"
        description={`Atualize as configurações da câmera`}
        status={status}
      />

      <CameraForm camera={camera} />
    </PageContent>
  );
}
