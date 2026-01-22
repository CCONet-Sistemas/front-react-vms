import type { Route } from "../+types/root";
import CameraForm from "~/features/camera/components/cameraForm";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Nova Câmera | VMS' },
    { name: 'description', content: 'Adicionar nova câmera - Video Management System' },
  ];
}

export default function NewCameraPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nova Câmera</h1>
        <p className="text-muted-foreground">Configure uma nova câmera no sistema</p>
      </div>
      <CameraForm />
    </div>
  );
}
