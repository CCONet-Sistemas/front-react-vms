import { useCamera } from "~/features/cameras";
import type { Route } from "../+types/root";
import CameraForm from "~/features/camera/components/cameraForm";
import { AlertCircle, Pause, Video, VideoOff } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { StreamState } from "~/types";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Editar Câmera | VMS' },
    { name: 'description', content: 'Editar câmera - Video Management System' },
  ];
}

const statusConfig: Record<
  StreamState,
  { label: string; variant: 'success' | 'secondary' | 'destructive' | 'warning'; status: StreamState, icon: typeof Video }
> = {
  created: { label: 'Criado', variant: 'secondary', status: 'created', icon: Video },
  starting: { label: 'Iniciando', variant: 'warning', status: 'starting', icon: Pause },
  streaming: { label: 'Transmitindo', variant: 'success', status: 'streaming', icon: Video },
  degraded: { label: 'Degradado', variant: 'warning', status: 'degraded', icon: AlertCircle },
  retrying: { label: 'Tentando Reconectar', variant: 'warning', status: 'retrying', icon: AlertCircle },
  paused: { label: 'Pausado', variant: 'secondary', status: 'paused', icon: Pause },
  offline: { label: 'Offline', variant: 'destructive', status: 'offline', icon: AlertCircle },
  stopped: { label: 'Parado', variant: 'secondary', status: 'stopped', icon: VideoOff },

};

export default function EditCameraPage({ params }: Route.ComponentProps) {
  const { uuid } = params;
  if (!uuid) {
    return <div>Câmera não encontrada</div>;
  }

  const cameraResult = useCamera(uuid);



  if (!cameraResult.error && !cameraResult.data) {
    return <div>Câmera não encontrada</div>;
  }


  const camera =  cameraResult.data;
  const streamState = camera?.streamStatus.state as StreamState;
  const status = statusConfig[streamState] ?? statusConfig.stopped;
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar Câmera</h1>
          <p className="text-muted-foreground">Atualize as configurações da câmera</p>
        </div>
        <div>
          <Badge variant={status.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>

        </div>
      </div>
      <CameraForm camera={camera} />
    </div>
  );
}
