import { z } from 'zod';

export const sendNotificationSchema = z
  .object({
    channel: z.enum(['email', 'sms', 'push', 'webhook']),
    recipient: z.string().min(1, 'Destinatário obrigatório'),
    subject: z.string().optional(),
    body: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high']),
    templateId: z.number().optional(),
    templateVariables: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .optional(),
    scheduledAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.templateId && !data.body?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o corpo da mensagem ou selecione um template',
        path: ['body'],
      });
    }
  });

export type SendNotificationFormData = z.infer<typeof sendNotificationSchema>;
