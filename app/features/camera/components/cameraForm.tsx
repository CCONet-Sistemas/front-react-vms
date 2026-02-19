import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { FormSection } from '~/components/ui/form-section';
import { Camera, Wifi, Video, Radio } from 'lucide-react';
import type { Camera as CameraType } from '~/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cameraSchema, type CameraFormData } from '../schemas/camera.schema';
import { useCreateCamera, useUpdateCamera } from '~/features/cameras/hooks/useCameras';
import { useNavigate } from 'react-router';
import { Select } from '~/components/ui/select';
import { Toaster } from '~/components/ui/sonner';
import { ProtectedFeature } from '~/components/common';

export default function CameraForm({ camera }: { camera?: CameraType }) {
  const navigate = useNavigate();
  const isEditMode = !!camera;

  const createMutation = useCreateCamera();
  const updateMutation = useUpdateCamera();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CameraFormData>({
    resolver: zodResolver(cameraSchema),
    defaultValues: camera
      ? {
          name: camera.name,
          mode: camera.mode,
          type: camera.type,
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
            width: camera.video?.width,
            height: camera.video?.height,
            codec: camera.video?.codec,
          },
          stream: {
            fps: camera.stream?.fps,
            scale: {
              x: camera.stream?.scale?.x,
              y: camera.stream?.scale?.y,
            },
          },
        }
      : undefined,
  });

  const onSubmit = async (data: CameraFormData) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          uuid: camera.uuid,
          data: data as any,
        });
        <Toaster />;
      } else {
        await createMutation.mutateAsync(data as any);
      }
    } catch (error) {
      alert(isEditMode ? 'Erro ao atualizar câmera' : 'Erro ao criar câmera');
      console.error(error);
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
          <Input
            label="Modo"
            error={!!errors.mode}
            helperText={errors.mode?.message}
            {...register('mode')}
          />
          <Input
            label="Tipo"
            error={!!errors.type}
            helperText={errors.type?.message}
            {...register('type')}
          />
          <div>
            <Select id="protocol" {...register('protocol')}>
              <option value="rtsp">RTSP</option>
              <option value="http">RTMP</option>
            </Select>
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
          <Input
            label="Usuário"
            autoComplete="off"
            {...register('connection.username')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="off"
            {...register('connection.password')}
          />
          <div className="sm:col-span-2">
            <Input
              label="Path"
              {...register('connection.path')}
            />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* VIDEO */}
      {/* ===================== */}
      <FormSection title="Vídeo">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Video className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de vídeo</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="FPS"
            type="number"
            {...register('video.fps')}
          />
          <Input
            label="Largura"
            type="number"
            {...register('video.width')}
          />
          <Input
            label="Altura"
            type="number"
            {...register('video.height')}
          />
          <Input
            label="Codec"
            {...register('video.codec')}
          />
        </div>
      </FormSection>

      {/* ===================== */}
      {/* STREAM */}
      {/* ===================== */}
      <FormSection title="Stream">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Radio className="h-4 w-4" />
          <span className="text-xs font-medium">Configurações de transmissão</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="FPS Stream"
            type="number"
            {...register('stream.fps')}
          />
          <Input
            label="Scale X"
            type="number"
            {...register('stream.scale.x')}
          />
          <Input
            label="Scale Y"
            type="number"
            {...register('stream.scale.y')}
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
