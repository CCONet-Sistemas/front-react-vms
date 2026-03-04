import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectOption, SelectOptGroup } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { CRON_OPTIONS } from '~/types/cron-expression.type';
import { scheduleSchema, type ScheduleFormData } from '../schemas/schedule.schema';
import { useNextExecutions } from '../hooks/useBackupSchedule';
import type { BackupSchedule } from '~/types/backup.types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Group the options by their group key
const CRON_GROUPS = CRON_OPTIONS.reduce<Record<string, typeof CRON_OPTIONS>>(
  (acc, option) => {
    if (!acc[option.group]) acc[option.group] = [];
    acc[option.group].push(option);
    return acc;
  },
  {}
);

interface ScheduleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => void;
  schedule?: BackupSchedule;
  isSubmitting?: boolean;
}

export function ScheduleFormDialog({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  isSubmitting,
}: ScheduleFormDialogProps) {
  const isEditing = !!schedule;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: '',
      description: '',
      cronExpression: '',
      type: 'FULL',
      enabled: true,
      retentionCount: 7,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        // cronExpression is a { label: value } object — extract the cron value
        const savedCronValue = Object.values(schedule.cronExpression)[0] ?? '';
        reset({
          name: schedule.name,
          description: schedule.description ?? '',
          cronExpression: savedCronValue,
          type: schedule.type,
          enabled: schedule.enabled,
          retentionCount: schedule.retentionCount,
        });
      } else {
        reset({
          name: '',
          description: '',
          cronExpression: '',
          type: 'FULL',
          enabled: true,
          retentionCount: 7,
        });
      }
    }
  }, [isOpen, schedule, reset]);

  const cronValue = watch('cronExpression');

  // Fetch next executions from API when editing
  const { data: nextExecData } = useNextExecutions(
    schedule?.id ?? '',
    isEditing && isOpen
  );

  const selectedLabel = useMemo(
    () => CRON_OPTIONS.find((o) => o.value === cronValue)?.label ?? null,
    [cronValue]
  );

  const nextExecutions = nextExecData?.nextExecutions ?? [];

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            {...register('name')}
            placeholder="Nome do agendamento"
            disabled={isSubmitting}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <Textarea
            label="Descrição"
            {...register('description')}
            placeholder=" "
            disabled={isSubmitting}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Tipo de Backup"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={isSubmitting}
              >
                <SelectOption value="FULL">Completo</SelectOption>
                <SelectOption value="INCREMENTAL">Incremental</SelectOption>
                <SelectOption value="DIFFERENTIAL">Diferencial</SelectOption>
                <SelectOption value="MANUAL">Manual</SelectOption>
                <SelectOption value="SCHEDULED">Agendado</SelectOption>
              </Select>
            )}
          />

          <div className="space-y-1.5">
            <Controller
              name="cronExpression"
              control={control}
              render={({ field }) => (
                <Select
                  label="Frequência"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={isSubmitting}
                  error={!!errors.cronExpression}
                  helperText={errors.cronExpression?.message}
                >
                  <SelectOption value="" disabled>
                    Selecione a frequência...
                  </SelectOption>
                  {Object.entries(CRON_GROUPS).map(([group, options]) => (
                    <SelectOptGroup key={group} label={group}>
                      {options.map((opt) => (
                        <SelectOption key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectOption>
                      ))}
                    </SelectOptGroup>
                  ))}
                </Select>
              )}
            />

            {/* Preview de próximas execuções (API, apenas ao editar) */}
            {isEditing && nextExecutions.length > 0 && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Próximas execuções:</p>
                <ul className="space-y-0.5">
                  {nextExecutions.map((date, i) => (
                    <li key={i}>{formatDate(date)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Label da expressão selecionada (apenas ao criar) */}
            {!isEditing && selectedLabel && (
              <p className="text-xs text-muted-foreground pl-1">
                <span className="font-mono bg-muted px-1 py-0.5 rounded">{cronValue}</span>
              </p>
            )}
          </div>

          <Input
            label="Retenções (máx. 365)"
            type="number"
            min={1}
            max={365}
            {...register('retentionCount', { valueAsNumber: true })}
            disabled={isSubmitting}
            error={!!errors.retentionCount}
            helperText={errors.retentionCount?.message}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Habilitado</span>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditing
                  ? 'Salvar'
                  : 'Criar Agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
