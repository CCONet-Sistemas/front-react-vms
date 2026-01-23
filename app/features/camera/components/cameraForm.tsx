import { Label } from '~/components/ui/label';
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
        console.log('Camera updated:', data);
        alert('Câmera atualizada com sucesso!');
      } else {
        await createMutation.mutateAsync(data as any);
        console.log('Camera created:', data);
      }
      // navigate('/cameras');
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
          <div className="space-y-2">
            <Label htmlFor="name" className="text-form-label">
              Nome do dispositivo
            </Label>
            <Input id="name" placeholder="ReoLinkWireless" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-form-label">
              Modo
            </Label>
            <Input id="mode" placeholder="start" {...register('mode')} />
            {errors.mode && <p className="text-sm text-destructive">{errors.mode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-form-label">
              Tipo
            </Label>
            <Input id="type" placeholder="h264" {...register('type')} />
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol" className="text-form-label">
              Protocolo
            </Label>
            <Select id="protocol" {...register('protocol')}>
              <option value="rtsp">RTSP</option>
              <option value="http">RTMP</option>
            </Select>

            {errors.protocol && (
              <p className="text-sm text-destructive">{errors.protocol.message}</p>
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
          <div className="space-y-2">
            <Label htmlFor="host" className="text-form-label">
              Host
            </Label>
            <Input id="host" placeholder="192.168.1.40" {...register('connection.host')} />
            {errors.connection?.host && (
              <p className="text-sm text-destructive">{errors.connection.host.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="port" className="text-form-label">
              Porta
            </Label>
            <Input id="port" type="number" placeholder="554" {...register('connection.port')} />
            {errors.connection?.port && (
              <p className="text-sm text-destructive">{errors.connection.port.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-form-label">
              Usuário
            </Label>
            <Input
              id="username"
              placeholder="admin"
              autoComplete="off"
              {...register('connection.username')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-form-label">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="off"
              {...register('connection.password')}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="path" className="text-form-label">
              Path
            </Label>
            <Input id="path" placeholder="/" {...register('connection.path')} />
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
          <div className="space-y-2">
            <Label htmlFor="fps" className="text-form-label">
              FPS
            </Label>
            <Input id="fps" type="number" placeholder="30" {...register('video.fps')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width" className="text-form-label">
              Largura
            </Label>
            <Input id="width" type="number" placeholder="1920" {...register('video.width')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-form-label">
              Altura
            </Label>
            <Input id="height" type="number" placeholder="1080" {...register('video.height')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codec" className="text-form-label">
              Codec
            </Label>
            <Input id="codec" placeholder="h264_cuvid" {...register('video.codec')} />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="streamFps" className="text-form-label">
              FPS Stream
            </Label>
            <Input id="streamFps" type="number" placeholder="15" {...register('stream.fps')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scaleX" className="text-form-label">
              Scale X
            </Label>
            <Input id="scaleX" type="number" placeholder="640" {...register('stream.scale.x')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scaleY" className="text-form-label">
              Scale Y
            </Label>
            <Input id="scaleY" type="number" placeholder="360" {...register('stream.scale.y')} />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate('/cameras')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar Câmera'}
        </Button>
      </div>
    </form>
  );
}
