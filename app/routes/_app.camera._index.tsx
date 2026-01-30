import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import type { Route } from '../+types/root';
import CameraForm from '~/features/camera/components/cameraForm';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Nova Câmera | VMS' },
    { name: 'description', content: 'Adicionar nova câmera - Video Management System' },
  ];
}

export default function NewCameraPage() {
  return (
    <ProtectedRoute resource="camera" action="create">
      <PageContent className="container mx-auto py-8 px-4">
        <PageHeader title="Nova Câmera" description="Adicionar nova câmera na aplicação" />
        <CameraForm />
      </PageContent>
    </ProtectedRoute>
  );
}
