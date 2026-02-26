import { useEffect } from 'react';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { FormSection } from '~/components/ui/form-section';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { Select } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { ProtectedFeature } from '~/components/common';
import { triggerSchema, type TriggerFormData } from '../schemas/trigger.schema';
import { useCameraTrigger, useCreateTrigger, useUpdateTrigger, useTestTrigger } from '../hooks';

interface TriggerFormProps {
  cameraId: string;
}

export function TriggerForm({ cameraId }: TriggerFormProps) {
  const { data: trigger, isLoading } = useCameraTrigger(cameraId);
  const createTrigger = useCreateTrigger();
  const updateTrigger = useUpdateTrigger();
  const testTrigger = useTestTrigger();

  const isEditMode = trigger != null && !!trigger.cameraId;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TriggerFormData>({
    resolver: zodResolver(triggerSchema),
    defaultValues: {
      webhookEnabled: false,
      webhookUrl: '',
      webhookMethod: 'POST',
      emailEnabled: false,
      sendEmail: '',
      emailTimeout: 30,
      commandEnabled: false,
      commandPath: '',
      commandTimeout: 30,
      recordingEnabled: false,
      saveEvents: false,
      videoLength: 60,
      snapSecondsInward: 5,
      detectorHttpApi: '',
      detectorSave: false,
      useDetectorFiltersObject: false,
      watchdogReset: false,
      detectorTriggerTags: '',
      inverseTrigger: false,
    },
  });

  useEffect(() => {
    if (trigger) {
      reset({
        webhookEnabled: Boolean(trigger.webhookEnabled),
        webhookUrl: typeof trigger.webhookUrl === 'string' ? trigger.webhookUrl : '',
        webhookMethod: trigger.webhookMethod ?? 'POST',
        emailEnabled: Boolean(trigger.emailEnabled),
        sendEmail: typeof trigger.sendEmail === 'string' ? trigger.sendEmail : '',
        emailTimeout: Number(trigger.emailTimeout) || 30,
        commandEnabled: Boolean(trigger.commandEnabled),
        commandPath: typeof trigger.commandPath === 'string' ? trigger.commandPath : '',
        commandTimeout: Number(trigger.commandTimeout) || 30,
        recordingEnabled: Boolean(trigger.recordingEnabled),
        saveEvents: Boolean(trigger.saveEvents),
        videoLength: Number(trigger.videoLength) || 60,
        snapSecondsInward: Number(trigger.snapSecondsInward) || 5,
        detectorHttpApi: typeof trigger.detectorHttpApi === 'string' ? trigger.detectorHttpApi : '',
        detectorSave: Boolean(trigger.detectorSave),
        useDetectorFiltersObject: Boolean(trigger.useDetectorFiltersObject),
        watchdogReset: Boolean(trigger.watchdogReset),
        detectorTriggerTags: typeof trigger.detectorTriggerTags === 'string' ? trigger.detectorTriggerTags : '',
        inverseTrigger: Boolean(trigger.inverseTrigger),
      });
    }
  }, [trigger, reset]);

  const webhookEnabled = watch('webhookEnabled');
  const emailEnabled = watch('emailEnabled');
  const commandEnabled = watch('commandEnabled');
  const recordingEnabled = watch('recordingEnabled');


  const onSubmit = async (data: TriggerFormData) => {
    try {
      const dto = { ...data, cameraId };
      if (isEditMode) {
        await updateTrigger.mutateAsync({ cameraId, dto });
        toast.success('Trigger atualizado com sucesso!');
      } else {
        await createTrigger.mutateAsync({ cameraId, dto });
        toast.success('Trigger criado com sucesso!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      toast.error(isEditMode ? 'Erro ao atualizar trigger' : 'Erro ao criar trigger', {
        description: message,
      });
    }
  };

  const onInvalidSubmit = (fieldErrors: FieldErrors<TriggerFormData>) => {
    console.error('Trigger form validation errors:', fieldErrors);
    toast.error('Verifique os campos do formulário');
  };

  const handleTest = async () => {
    try {
      await testTrigger.mutateAsync(cameraId);
      toast.success('Trigger testado com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      toast.error('Erro ao testar trigger', { description: message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-6">
      {/* ===================== */}
      {/* TAGS */}
      {/* ===================== */}
      <FormSection title="Tags de detecção">
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              label="Tags (separadas por vírgula)"
              placeholder="Ex: motion, person"
              helperText="Deixe vazio para disparar em qualquer evento."
              {...register('detectorTriggerTags')}
            />
          </div>
          <div className="flex items-center gap-3">
            <Controller
              name="inverseTrigger"
              control={control}
              render={({ field }) => (
                <Switch
                  id="inverseTrigger"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="inverseTrigger" className="cursor-pointer">
              Inverter trigger (disparar quando tags NÃO forem detectadas)
            </Label>
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* WEBHOOK */}
      {/* ===================== */}
      <FormSection title="Webhook">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Controller
              name="webhookEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="webhookEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="webhookEnabled" className="cursor-pointer">
              Ativar webhook
            </Label>
          </div>
          {webhookEnabled && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  label="URL"
                  placeholder="https://example.com/webhook"
                  error={!!errors.webhookUrl}
                  helperText={errors.webhookUrl?.message}
                  {...register('webhookUrl')}
                />
              </div>
              <Select label="Método" id="webhookMethod" {...register('webhookMethod')}>
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </Select>
            </div>
          )}
        </div>
      </FormSection>

      {/* ===================== */}
      {/* EMAIL */}
      {/* ===================== */}
      <FormSection title="Email">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Controller
              name="emailEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="emailEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="emailEnabled" className="cursor-pointer">
              Ativar email
            </Label>
          </div>
          {emailEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Destinatários (separados por vírgula)"
                placeholder="email@exemplo.com, outro@exemplo.com"
                error={!!errors.sendEmail}
                helperText={errors.sendEmail?.message}
                {...register('sendEmail')}
              />
              <Input
                label="Timeout (s)"
                type="number"
                min={0}
                error={!!errors.emailTimeout}
                helperText={errors.emailTimeout?.message}
                {...register('emailTimeout', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* ===================== */}
      {/* COMANDO */}
      {/* ===================== */}
      <FormSection title="Comando">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Controller
              name="commandEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="commandEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="commandEnabled" className="cursor-pointer">
              Ativar comando
            </Label>
          </div>
          {commandEnabled && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  label="Caminho do comando"
                  placeholder="Ex: /usr/local/bin/alert.sh"
                  error={!!errors.commandPath}
                  helperText={errors.commandPath?.message}
                  {...register('commandPath')}
                />
              </div>
              <Input
                label="Timeout (s)"
                type="number"
                min={0}
                error={!!errors.commandTimeout}
                helperText={errors.commandTimeout?.message}
                {...register('commandTimeout', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* ===================== */}
      {/* GRAVAÇÃO */}
      {/* ===================== */}
      <FormSection title="Gravação">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Controller
              name="recordingEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="recordingEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="recordingEnabled" className="cursor-pointer">
              Ativar gravação
            </Label>
          </div>
          {recordingEnabled && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Duração do vídeo (s)"
                type="number"
                min={0}
                error={!!errors.videoLength}
                helperText={errors.videoLength?.message}
                {...register('videoLength', { valueAsNumber: true })}
              />
              <Input
                label="Segundos de antecipação"
                type="number"
                min={0}
                error={!!errors.snapSecondsInward}
                helperText={errors.snapSecondsInward?.message}
                {...register('snapSecondsInward', { valueAsNumber: true })}
              />
              <div className="flex items-center gap-3 pt-6">
                <Controller
                  name="saveEvents"
                  control={control}
                  render={({ field }) => (
                    <Switch id="saveEvents" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="saveEvents" className="cursor-pointer">
                  Salvar eventos
                </Label>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* ===================== */}
      {/* AVANÇADO */}
      {/* ===================== */}
      <FormSection title="Avançado">
        <div className="space-y-4">
          <Input
            label="API HTTP do detector"
            placeholder="http://detector:8080/api"
            {...register('detectorHttpApi')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Controller
                name="detectorSave"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="detectorSave"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="detectorSave" className="cursor-pointer">
                Salvar detector
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Controller
                name="useDetectorFiltersObject"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="useDetectorFiltersObject"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="useDetectorFiltersObject" className="cursor-pointer">
                Filtros de objeto
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Controller
                name="watchdogReset"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="watchdogReset"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="watchdogReset" className="cursor-pointer">
                Watchdog reset
              </Label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}
      <div className="flex justify-between gap-3 pt-2">
        <ProtectedFeature resource="camera" action="update">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={testTrigger.isPending}
            onClick={handleTest}
          >
            <Zap className="mr-1.5 h-4 w-4" />
            {testTrigger.isPending ? 'Testando...' : 'Testar trigger'}
          </Button>
        </ProtectedFeature>
        <ProtectedFeature resource="camera" action="update">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar trigger'}
          </Button>
        </ProtectedFeature>
      </div>
    </form>
  );
}
