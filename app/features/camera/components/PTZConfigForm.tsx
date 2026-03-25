import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FormSection } from '~/components/ui/form-section';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { Select, SelectOption } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { ProtectedFeature } from '~/components/common';
import { ptzConfigSchema, type PtzConfigFormData } from '../schemas/ptz.schema';
import { useUpdatePtzConfig } from '../hooks/usePtzConfig';
import type { Camera } from '~/types/camera.types';

interface PTZConfigFormProps {
  cameraId: string;
  camera: Camera;
}

export function PTZConfigForm({ cameraId, camera }: PTZConfigFormProps) {
  const updatePtzConfig = useUpdatePtzConfig();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PtzConfigFormData>({
    resolver: zodResolver(ptzConfigSchema),
    defaultValues: {
      enabled: camera.control?.enabled ?? false,
      base_url: camera.control?.base_url ?? '',
      ptz_protocol: camera.control?.ptz_protocol ?? 'onvif',
      onvif_port: camera.control?.onvif_port ?? 80,
      onvif_event_mode: camera.control?.onvif_event_mode ?? null,
    },
  });

  const enabled = watch('enabled');

  useEffect(() => {
    if (camera) {
      const control = camera.control || {};
      reset({
        enabled: control.enabled ?? false,
        base_url: control.base_url ?? '',
        ptz_protocol: control.ptz_protocol ?? 'onvif',
        onvif_port: control.onvif_port ?? 80,
        onvif_event_mode: control.onvif_event_mode ?? null,
      });
    }
  }, [camera, reset]);

  const onSubmit = async (data: PtzConfigFormData) => {
    try {
      await updatePtzConfig.mutateAsync({
        cameraId,
        config: {
          enabled: data.enabled,
          base_url: data.base_url,
          ptz_protocol: data.ptz_protocol,
          onvif_port: data.onvif_port,
          onvif_event_mode: data.onvif_event_mode || null,
        },
      });
      toast.success('Configuração PTZ atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar PTZ:', error);
      // O erro já é tratado pelo interceptor
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" key={camera?.uuid}>
      <FormSection title="Configurações ONVIF/PTZ">
        <p className="text-sm text-muted-foreground mb-4">Configure as opções ONVIF</p>

        <div className="grid gap-4">
          {/* Habilitar ONVIF */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Habilitar ONVIF</Label>
              <p className="text-sm text-muted-foreground">
                Ativa o controle de movimento da câmera
              </p>
            </div>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch id="enabled" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          {enabled && (
            <>
              {/* Base URL / Host */}
              <div className="grid gap-2">
                <Input
                  id="base_url"
                  type="text"
                  label="Host / Base URL"
                  placeholder="http://admin:senha@192.168.1.40:80"
                  helperText="URL do dispositivo. Pode incluir credenciais (http://user:pass@host:porta)"
                  error={!!errors.base_url}
                  {...register('base_url')}
                />
              </div>

              {/* Protocolo PTZ */}
              <div className="grid gap-2">
                <Controller
                  name="ptz_protocol"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="ptz_protocol"
                      value={String(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      label="Protocolo PTZ"
                      error={!!errors.ptz_protocol}
                      helperText={
                        errors.ptz_protocol?.message ||
                        'HTTP CGI usa URLs personalizadas, ONVIF usa protocolo SOAP padrão'
                      }
                    >
                      <SelectOption value="http_cgi">HTTP CGI</SelectOption>
                      <SelectOption value="onvif">ONVIF</SelectOption>
                    </Select>
                  )}
                />
              </div>

              {/* Porta ONVIF */}
              <div className="grid gap-2">
                <Input
                  id="onvif_port"
                  type="number"
                  label="Porta ONVIF"
                  min={1}
                  max={65535}
                  placeholder="80"
                  helperText="Porta do serviço ONVIF do dispositivo (padrão: 80)"
                  error={!!errors.onvif_port}
                  {...register('onvif_port', { valueAsNumber: true })}
                />
              </div>

              {/* Modo de eventos ONVIF */}
              <div className="grid gap-2">
                <Controller
                  name="onvif_event_mode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="onvif_event_mode"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      label="Modo de Eventos ONVIF"
                      error={!!errors.onvif_event_mode}
                      helperText={
                        errors.onvif_event_mode?.message ||
                        'Pull Point: servidor consulta periodicamente • Push: câmera envia notificações • Ambos: usa os dois modos'
                      }
                    >
                      <SelectOption value="">Desabilitado</SelectOption>
                      <SelectOption value="pullpoint">Pull Point (Polling)</SelectOption>
                      <SelectOption value="push">Push (Notify)</SelectOption>
                      <SelectOption value="both">Ambos</SelectOption>
                    </Select>
                  )}
                />
              </div>
            </>
          )}
        </div>
      </FormSection>

      {/* Actions */}
      <ProtectedFeature resource="camera" action="update">
        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </ProtectedFeature>
    </form>
  );
}
