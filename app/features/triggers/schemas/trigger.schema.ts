import { z } from 'zod';

export const triggerSchema = z.object({
  // Webhook
  webhookEnabled: z.boolean(),
  webhookUrl: z.string(),
  webhookMethod: z.enum(['GET', 'POST', 'PUT']),

  // Email
  emailEnabled: z.boolean(),
  sendEmail: z.string(),
  emailTimeout: z.number().min(0),

  // Comando
  commandEnabled: z.boolean(),
  commandPath: z.string(),
  commandTimeout: z.number().min(0),

  // Gravação
  recordingEnabled: z.boolean(),
  saveEvents: z.boolean(),
  videoLength: z.number().min(0),
  snapSecondsInward: z.number().min(0),

  // Avançado
  detectorHttpApi: z.string(),
  detectorSave: z.boolean(),
  useDetectorFiltersObject: z.boolean(),
  watchdogReset: z.boolean(),
  detectorTriggerTags: z.string(),
  inverseTrigger: z.boolean(),
});

export type TriggerFormData = z.infer<typeof triggerSchema>;
