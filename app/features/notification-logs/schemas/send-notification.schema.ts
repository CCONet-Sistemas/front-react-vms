import { z } from 'zod';

export const sendNotificationSchema = z.object({
  channel: z.enum(['email', 'sms', 'push', 'webhook']),
  recipient: z.string().min(1, 'Destinatário obrigatório'),
  subject: z.string().optional(),
  body: z.string().min(1, 'Corpo da mensagem obrigatório'),
  priority: z.enum(['low', 'normal', 'high']),
  templateId: z.number().optional(),
  templateVariables: z
    .string()
    .optional()
    .refine((val) => {
      if (!val?.trim()) return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'JSON inválido'),
  scheduledAt: z.string().optional(),
});

export type SendNotificationFormData = z.infer<typeof sendNotificationSchema>;
