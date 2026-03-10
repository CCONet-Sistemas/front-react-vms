import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { FormSection } from '~/components/ui/form-section';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { Select, SelectOption } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { ProtectedFeature } from '~/components/common';
import { RegionEditor, rectToPoints } from './RegionEditor';
import {
  useDetectionByCameraId,
  useCreateDetection,
  useUpdateDetection,
  useDeleteDetection,
} from '../hooks/useDetection';
import type { Camera } from '~/types/camera.types';

const regionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
  tag: z.string().default('motion'),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
});

const detectionSchema = z.object({
  enabled: z.boolean().default(false),
  method: z.enum(['motion', 'object', 'both']).default('motion'),
  sensitivity: z.coerce.number().min(0).max(1).default(0.5),
  threshold: z.coerce.number().min(0).max(1).default(0.5),
  maxSensitivity: z.coerce.number().min(0).default(1),
  detectMotion: z.boolean().default(true),
  detectObject: z.boolean().default(false),
  objectFilter: z.string().default(''),
  sendFrames: z.boolean().default(false),
  motionFirst: z.boolean().default(false),
  detectorTimeout: z.coerce.number().min(0).default(30),
  detectorBuffer: z.coerce.number().min(0).default(5),
  detectorFps: z.coerce.number().min(0).default(5),
  detectorPam: z.coerce.number().min(0).default(1),
  scaleX: z.coerce.number().min(0).default(1),
  scaleY: z.coerce.number().min(0).default(1),
  useDetectorFilters: z.coerce.number().min(0).default(0),
  detectorDeleteMotionlessVideos: z.coerce.number().min(0).default(0),
  detectorBufferSecondsBefore: z.coerce.number().min(0).default(2),
  detectorLockTimeout: z.coerce.number().min(0).default(0),
  detectorMotionSaveFrame: z.coerce.number().min(0).default(0),
  detectorColorThreshold: z.coerce.number().min(0).default(15),
  detectorMotionTileMode: z.coerce.number().min(0).default(0),
  detectorNoiseFilter: z.coerce.number().min(0).default(0),
  detectorNoiseFilterRange: z.coerce.number().min(0).default(2),
  detectorFrame: z.coerce.number().min(0).default(0),
  regions: z.array(regionSchema).default([]),
});

type DetectionFormData = z.infer<typeof detectionSchema>;

interface DetectionFormProps {
  cameraId: string;
  camera: Camera;
}

export function DetectionForm({ cameraId, camera }: DetectionFormProps) {
  const { data: detection, isLoading } = useDetectionByCameraId(cameraId);
  const createDetection = useCreateDetection();
  const updateDetection = useUpdateDetection();
  const deleteDetection = useDeleteDetection();

  const isEditMode = !!detection;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DetectionFormData>({
    resolver: zodResolver(detectionSchema),
    defaultValues: {
      enabled: false,
      method: 'motion',
      sensitivity: 0.5,
      threshold: 0.5,
      maxSensitivity: 1,
      detectMotion: true,
      detectObject: false,
      objectFilter: '',
      sendFrames: false,
      motionFirst: false,
      detectorTimeout: 30,
      detectorBuffer: 5,
      detectorFps: 5,
      detectorPam: 1,
      scaleX: 1,
      scaleY: 1,
      useDetectorFilters: 0,
      detectorDeleteMotionlessVideos: 0,
      detectorBufferSecondsBefore: 2,
      detectorLockTimeout: 0,
      detectorMotionSaveFrame: 0,
      detectorColorThreshold: 15,
      detectorMotionTileMode: 0,
      detectorNoiseFilter: 0,
      detectorNoiseFilterRange: 2,
      detectorFrame: 0,
      regions: [],
    },
  });

  useEffect(() => {
    if (detection) {
      reset({
        enabled: detection.enabled,
        method: detection.method,
        sensitivity: detection.sensitivity,
        threshold: detection.threshold,
        maxSensitivity: detection.maxSensitivity,
        detectMotion: detection.detectMotion,
        detectObject: detection.detectObject,
        objectFilter: detection.objectFilter,
        sendFrames: detection.sendFrames,
        motionFirst: detection.motionFirst,
        detectorTimeout: detection.detectorTimeout,
        detectorBuffer: detection.detectorBuffer,
        detectorFps: detection.detectorFps,
        detectorPam: detection.detectorPam,
        scaleX: detection.scaleX,
        scaleY: detection.scaleY,
        useDetectorFilters: detection.useDetectorFilters,
        detectorDeleteMotionlessVideos: detection.detectorDeleteMotionlessVideos,
        detectorBufferSecondsBefore: detection.detectorBufferSecondsBefore,
        detectorLockTimeout: detection.detectorLockTimeout,
        detectorMotionSaveFrame: detection.detectorMotionSaveFrame,
        detectorColorThreshold: detection.detectorColorThreshold,
        detectorMotionTileMode: detection.detectorMotionTileMode,
        detectorNoiseFilter: detection.detectorNoiseFilter,
        detectorNoiseFilterRange: detection.detectorNoiseFilterRange,
        detectorFrame: detection.detectorFrame,
        regions: detection.regions ?? [],
      });
    }
  }, [detection, reset]);

  const onSubmit = async (data: DetectionFormData) => {
    try {
      const regions = data.regions.map((r) => ({
        ...r,
        points: r.points?.length ? r.points : rectToPoints(r.x, r.y, r.width, r.height),
      }));
      const dto = { ...data, regions, cameraId };
      if (isEditMode) {
        await updateDetection.mutateAsync({ uuid: detection.uuid, dto });
        toast.success('Detecção atualizada com sucesso!');
      } else {
        await createDetection.mutateAsync({ cameraId, dto });
        toast.success('Detecção criada com sucesso!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      toast.error(isEditMode ? 'Erro ao atualizar detecção' : 'Erro ao criar detecção', {
        description: message,
      });
    }
  };

  const handleDelete = async () => {
    if (!detection) return;
    try {
      await deleteDetection.mutateAsync({ uuid: detection.uuid, cameraId });
      toast.success('Configuração de detecção removida');
      reset();
    } catch {
      toast.error('Erro ao remover detecção');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ===================== */}
      {/* ATIVAÇÃO */}
      {/* ===================== */}
      <FormSection title="Ativação">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch id="enabled" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Detecção ativada
            </Label>
          </div>
          <div>
            <Select label="Método" id="method" error={!!errors.method} {...register('method')}>
              <SelectOption value="motion">Movimento</SelectOption>
              <SelectOption value="object">Objeto</SelectOption>
              <SelectOption value="both">Ambos</SelectOption>
            </Select>
            {errors.method && (
              <p className="mt-1 pl-3.5 text-sm text-destructive">{errors.method.message}</p>
            )}
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* MOVIMENTO */}
      {/* ===================== */}
      <FormSection title="Movimento">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Controller
              name="detectMotion"
              control={control}
              render={({ field }) => (
                <Switch id="detectMotion" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="detectMotion" className="cursor-pointer">
              Detectar movimento
            </Label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Sensibilidade (0-1)"
              type="number"
              step="0.01"
              min={0}
              max={1}
              error={!!errors.sensitivity}
              helperText={errors.sensitivity?.message}
              {...register('sensitivity')}
            />
            <Input
              label="Threshold (0-1)"
              type="number"
              step="0.01"
              min={0}
              max={1}
              error={!!errors.threshold}
              helperText={errors.threshold?.message}
              {...register('threshold')}
            />
            <Input
              label="Sensibilidade Máxima"
              type="number"
              step="0.01"
              min={0}
              error={!!errors.maxSensitivity}
              helperText={errors.maxSensitivity?.message}
              {...register('maxSensitivity')}
            />
          </div>
        </div>
      </FormSection>

      {/* ===================== */}
      {/* OBJETOS */}
      {/* ===================== */}
      <FormSection title="Objetos">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Controller
                name="detectObject"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="detectObject"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="detectObject" className="cursor-pointer">
                Detectar objetos
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Controller
                name="sendFrames"
                control={control}
                render={({ field }) => (
                  <Switch id="sendFrames" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="sendFrames" className="cursor-pointer">
                Enviar frames
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Controller
                name="motionFirst"
                control={control}
                render={({ field }) => (
                  <Switch id="motionFirst" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="motionFirst" className="cursor-pointer">
                Movimento primeiro
              </Label>
            </div>
          </div>
          <Input
            label="Filtro de objetos"
            placeholder="Ex: person,car"
            {...register('objectFilter')}
          />
        </div>
      </FormSection>

      {/* ===================== */}
      {/* DETECTOR */}
      {/* ===================== */}
      <FormSection title="Detector">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Timeout (s)"
            type="number"
            min={0}
            error={!!errors.detectorTimeout}
            helperText={errors.detectorTimeout?.message}
            {...register('detectorTimeout')}
          />
          <Input
            label="Buffer (s)"
            type="number"
            min={0}
            error={!!errors.detectorBuffer}
            helperText={errors.detectorBuffer?.message}
            {...register('detectorBuffer')}
          />
          <Input
            label="FPS"
            type="number"
            min={0}
            error={!!errors.detectorFps}
            helperText={errors.detectorFps?.message}
            {...register('detectorFps')}
          />
          <Input
            label="PAM"
            type="number"
            min={0}
            error={!!errors.detectorPam}
            helperText={errors.detectorPam?.message}
            {...register('detectorPam')}
          />
          <Input
            label="Scale X"
            type="number"
            step="0.01"
            min={0}
            error={!!errors.scaleX}
            helperText={errors.scaleX?.message}
            {...register('scaleX')}
          />
          <Input
            label="Scale Y"
            type="number"
            step="0.01"
            min={0}
            error={!!errors.scaleY}
            helperText={errors.scaleY?.message}
            {...register('scaleY')}
          />
        </div>
      </FormSection>

      {/* ===================== */}
      {/* AVANÇADO */}
      {/* ===================== */}
      <FormSection title="Avançado">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            label="Filtros detector"
            type="number"
            min={0}
            {...register('useDetectorFilters')}
          />
          <Input
            label="Del. vídeos s/ mov."
            type="number"
            min={0}
            {...register('detectorDeleteMotionlessVideos')}
          />
          <Input
            label="Buffer antes (s)"
            type="number"
            min={0}
            {...register('detectorBufferSecondsBefore')}
          />
          <Input
            label="Lock timeout (s)"
            type="number"
            min={0}
            {...register('detectorLockTimeout')}
          />
          <Input
            label="Salvar frame mov."
            type="number"
            min={0}
            {...register('detectorMotionSaveFrame')}
          />
          <Input
            label="Threshold cor"
            type="number"
            min={0}
            {...register('detectorColorThreshold')}
          />
          <Input label="Tile mode" type="number" min={0} {...register('detectorMotionTileMode')} />
          <Input
            label="Filtro de ruído"
            type="number"
            min={0}
            {...register('detectorNoiseFilter')}
          />
          <Input
            label="Range filtro ruído"
            type="number"
            min={0}
            {...register('detectorNoiseFilterRange')}
          />
          <Input label="Frame" type="number" min={0} {...register('detectorFrame')} />
        </div>
      </FormSection>

      {/* ===================== */}
      {/* REGIÕES */}
      {/* ===================== */}
      <FormSection title="Regiões de Detecção">
        <Controller
          name="regions"
          control={control}
          render={({ field }) => (
            <RegionEditor
              regions={field.value}
              onChange={field.onChange}
              snapshotUrl={camera.images?.[0]?.thumbnailUrl || ''}
            />
          )}
        />
      </FormSection>

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}
      <div className="flex justify-between gap-3 pt-2">
        {isEditMode && (
          <ProtectedFeature resource="camera" action="update">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteDetection.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {deleteDetection.isPending ? 'Removendo...' : 'Remover detecção'}
            </Button>
          </ProtectedFeature>
        )}
        <div className="ml-auto">
          <ProtectedFeature resource="camera" action="update">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar configuração'}
            </Button>
          </ProtectedFeature>
        </div>
      </div>
    </form>
  );
}
