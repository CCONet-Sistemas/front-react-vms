import { z } from 'zod';

export const scheduleSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  cronExpression: z.string().min(1, 'Selecione uma frequência'),
  type: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'MANUAL', 'SCHEDULED']),
  enabled: z.boolean(),
  retentionCount: z.number().min(1, 'Mínimo 1').max(365, 'Máximo 365 dias').optional(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;
