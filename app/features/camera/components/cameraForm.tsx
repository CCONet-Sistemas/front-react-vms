import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { FormSection } from '~/components/ui/form-section';
import { Camera, Wifi, Video, Radio } from 'lucide-react';
import type { Camera as CameraType } from '~/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cameraSchema, type CameraFormData, type CameraFormInput } from '../schemas/camera.schema';
import { useCreateCamera, useUpdateCamera } from '~/features/cameras/hooks/useCameras';
import { useNavigate } from 'react-router';
import { Select, SelectOption } from '~/components/ui/select';
import { toast } from 'sonner';
import { ProtectedFeature } from '~/components/common';
import { getVideoQualityOptions } from '~/types';

export default function CameraForm({ camera }: { camera?: CameraType }) {
  const navigate = useNavigate();
  const isEditMode = !!camera;

  const createMutation = useCreateCamera();
  const updateMutation = useUpdateCamera();

  // Get quality options for dropdowns
  const qualityOptions = getVideoQualityOptions();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CameraFormInput, unknown, CameraFormData>({
    resolver: zodResolver(cameraSchema),
    defaultValues: camera
      ? {
          name: camera.name,
          mode: camera.mode,
          type: (camera.type as 'rtsp' | 'rtmp') || 'rtsp',
          protocol: camera.protocol,
          connection: {
            host: camera.connection?.host || '',
            port: camera.connection?.port || 554,
            username: camera.connection?.username || '',
            password: camera.connection?.password || '',
            path: camera.connection?.path || '/',
            protocol: camera.connection?.protocol || 'rtsp',
          },
          video: {
            fps: camera.video?.fps,
            quality: camera.video?.quality as '4k' | 'fullhd' | 'hd' | 'sd' | 'low',
            codec: (camera.video?.codec as 'copy' | 'h264' | 'h265') || 'h264',
          },
          stream: {
            fps: camera.stream?.fps,
            quality: camera.stream?.quality as '4k' | 'fullhd' | 'hd' | 'sd' | 'low',
          },
          recording: {
            vcodec: camera.recording?.vcodec,
            acodec: camera.recording?.acodec,
            crf: camera.recording?.crf,
            cutoff: camera.recording?.cutoff,
            storageDays: camera.recording?.storageDays,
          },
        }
      : {
          mode: 'start',
          type: 'rtsp',
          protocol: 'rtsp',
          status: 'recording',
          connection: {
            host: '',
            port: 554,
            username: '',
            password: '',
            path: '/',
            protocol: 'rtsp',
            auto_host_enable: false,
            auto_host: '',
            rtsp_transport: 'tcp',
          },
          video: {
            quality: 'fullhd',
          },
          stream: {
            quality: 'hd',
          },
          recording: {
            vcodec: 'copy',
            acodec: 'no',
            crf: 1,
            cutoff: '15',
            storageDays: 7,
          },
        },
  });
  console.log('Form errors:', errors);
  const onSubmit = async (data: CameraFormData) => {
    try {
      // Convert quality presets back to width/height and scale for API
      if (isEditMode) {
        await updateMutation.mutateAsync({ uuid: camera.uuid, data: data as any });
        toast.success('Câmera atualizada com sucesso!');
      } else {
        const created = await createMutation.mutateAsync(data as any);
        toast.success('Câmera criada com sucesso!');
        navigate(`/camera/${created.uuid}`);
      }
    } catch (error: any) {
      const raw = error?.response?.data?.message ?? error?.message;
      const message =
        typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw.join(', ')
            : 'Erro ao salvar câmera';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ===================== */}
      {/* DEVICE INFO */}
      {/* ===================== */}
      <FormSection title="Dispositivo">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Camera className="h-4 w-4" />
          <span className="text-xs font-medium">Informações do dispositivo</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome do dispositivo"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
          <Controller
            name="mode"
            control={control}
            render={({ field }) => (
              <Select
                label="Modo"
                error={!!errors.mode}
                helperText={errors.mode?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <SelectOption value="start">Start</SelectOption>
                <SelectOption value="stop">Stop</SelectOption>
              </Select>
            )}
          />

          <div>
            <Controller
              name="protocol"
              control={control}
              render={({ field }) => (
                <Select
                  label="Protocolo"
                  error={!!errors.protocol}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <SelectOption value="rtsp">RTSP</SelectOption>
                  <SelectOption value="rtmp">RTMP</SelectOption>
                </Select>
              )}
            />
            {errors.protocol && (
              <p className="text-sm text-destructive mt-1 pl-3.5">{errors.protocol.message}</p>
            )}
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* CONNECTION */}
      {/* ===================== */}
      <FormSection title="Conexão">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Wifi className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de rede</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Host"
            error={!!errors.connection?.host}
            helperText={errors.connection?.host?.message}
            {...register('connection.host')}
          />
          <Input
            label="Porta"
            type="number"
            error={!!errors.connection?.port}
            helperText={errors.connection?.port?.message}
            {...register('connection.port')}
          />
          <Input label="Usuário" autoComplete="off" {...register('connection.username')} />
          <Input
            label="Senha"
            type="password"
            autoComplete="off"
            {...register('connection.password')}
          />
          <div className="sm:col-span-2">
            <Input label="Path" {...register('connection.path')} />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* VIDEO */}
      {/* ===================== */}
      <FormSection title="Vídeo">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Video className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de vídeo (gravação)</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="FPS"
            type="number"
            {...register('video.fps', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          />
          <Controller
            name="video.quality"
            control={control}
            render={({ field }) => (
              <Select
                label="Qualidade"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {qualityOptions.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            )}
          />
          <Controller
            name="video.codec"
            control={control}
            render={({ field }) => (
              <Select
                label="Codec"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <SelectOption value="copy">Copy</SelectOption>
                <SelectOption value="h264">H.264</SelectOption>
                <SelectOption value="h265">H.265</SelectOption>
              </Select>
            )}
          />
        </div>
      </FormSection>

      {/* ===================== */}
      {/* STREAM */}
      {/* ===================== */}
      <FormSection title="Stream">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Radio className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de transmissão ao vivo</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="FPS Stream"
            type="number"
            {...register('stream.fps', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          />
          <Controller
            name="stream.quality"
            control={control}
            render={({ field }) => (
              <Select
                label="Qualidade Stream"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {qualityOptions.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            )}
          />
        </div>
      </FormSection>

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate('/cameras')}>
          Cancelar
        </Button>
        <ProtectedFeature resource="camera" action={isEditMode ? 'update' : 'create'}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar Câmera'}
          </Button>
        </ProtectedFeature>
      </div>
    </form>
  );
}
