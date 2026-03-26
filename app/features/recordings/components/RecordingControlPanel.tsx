import { useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { FormSection } from '~/components/ui/form-section';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ProtectedFeature } from '~/components/common';
import { useUpdateCamera } from '~/features/cameras/hooks/useCameras';
import {
  useRecordingStatus,
  useStartRecording,
  useStopRecording,
  usePauseRecording,
  useResumeRecording,
} from '../hooks/useRecordingControls';
import type { Camera } from '~/types/camera.types';
import type { RecordingControlState } from '~/types/recordings.types';

interface RecordingControlPanelProps {
  cameraId: string;
  camera: Camera;
}

const stateConfig: Record<
  RecordingControlState,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  recording: { label: 'Gravando', variant: 'default' },
  paused: { label: 'Pausado', variant: 'secondary' },
  stopped: { label: 'Parado', variant: 'outline' },
  error: { label: 'Erro', variant: 'destructive' },
  idle: { label: 'Ocioso', variant: 'outline' },
};

export function RecordingControlPanel({ cameraId, camera }: RecordingControlPanelProps) {
  const { data: status, isLoading } = useRecordingStatus(cameraId);
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const pauseRecording = usePauseRecording();
  const resumeRecording = useResumeRecording();
  const updateCamera = useUpdateCamera();

  const [retentionDays, setRetentionDays] = useState<number>(camera.recording?.retentionDays ?? 7);

  const state = status?.controlState ?? 'idle';
  const stateInfo = stateConfig[state];
  const isMutating =
    startRecording.isPending ||
    stopRecording.isPending ||
    pauseRecording.isPending ||
    resumeRecording.isPending;
  function handleSaveRetention() {
    const recording = camera.recording
      ? { ...camera.recording, retentionDays: retentionDays }
      : { retentionDays: retentionDays };
    updateCamera.mutate({
      uuid: cameraId,
      data: { ...camera, recording },
    });
  }

  return (
    <FormSection title="Gravação">
      <div className="space-y-6">
        {/* Status em Tempo Real */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Status</h3>
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Carregando...</span>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={stateInfo.variant}>{stateInfo.label}</Badge>
                {status?.startedAt && (
                  <span className="text-xs text-muted-foreground">
                    Iniciado em {new Date(status.startedAt).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              {state === 'error' && status?.errorMessage && (
                <p className="text-sm text-destructive">{status.errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Controles */}
        <ProtectedFeature resource="camera" action="update">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Controles</h3>
            <div className="flex flex-wrap gap-2">
              {(state === 'stopped' || state === 'idle' || state === 'error') && (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isMutating}
                  onClick={() => startRecording.mutate(cameraId)}
                >
                  <Play className="mr-1 h-4 w-4" />
                  Iniciar
                </Button>
              )}

              {state === 'recording' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    disabled={isMutating}
                    onClick={() => pauseRecording.mutate(cameraId)}
                  >
                    <Pause className="mr-1 h-4 w-4" />
                    Pausar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isMutating}
                    onClick={() => stopRecording.mutate(cameraId)}
                  >
                    <Square className="mr-1 h-4 w-4" />
                    Parar
                  </Button>
                </>
              )}

              {state === 'paused' && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isMutating}
                    onClick={() => resumeRecording.mutate(cameraId)}
                  >
                    <Play className="mr-1 h-4 w-4" />
                    Retomar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isMutating}
                    onClick={() => stopRecording.mutate(cameraId)}
                  >
                    <Square className="mr-1 h-4 w-4" />
                    Parar
                  </Button>
                </>
              )}
            </div>
          </div>
        </ProtectedFeature>

        {/* Configuração de Retenção */}
        <ProtectedFeature resource="camera" action="update">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Retenção</h3>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="retentionDays" className="text-xs text-muted-foreground">
                  Dias de retenção
                </Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min={1}
                  max={30}
                  className="w-32"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={updateCamera.isPending}
                onClick={handleSaveRetention}
              >
                {updateCamera.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </ProtectedFeature>

        {/* Sincronização */}
        {status && (status.sessionId || status.startedAt) && (
          <div className="space-y-1 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <h3 className="font-medium text-foreground">Sincronização</h3>
            {status.sessionId && (
              <p>
                <span className="font-medium">Session ID:</span> {status.sessionId}
              </p>
            )}
            {status.startedAt && (
              <p>
                <span className="font-medium">Início:</span>{' '}
                {new Date(status.startedAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}
      </div>
    </FormSection>
  );
}
