import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  channel: z.enum(['email', 'sms', 'push', 'webhook']),
  subjectTemplate: z.string().optional(),
  bodyTemplate: z.string().min(1, 'Corpo obrigatório'),
  isActive: z.boolean(),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
