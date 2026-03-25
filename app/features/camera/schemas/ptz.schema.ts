import { z } from 'zod';

export const ptzProtocolEnum = z.enum(['http_cgi', 'onvif']);
export const onvifEventModeEnum = z.enum(['pullpoint', 'push', 'both']);

export const ptzConfigSchema = z.object({
  enabled: z.boolean(),
  base_url: z.string().optional(),
  ptz_protocol: ptzProtocolEnum,
  onvif_port: z.number().int().min(1).max(65535),
  onvif_event_mode: onvifEventModeEnum.nullable().optional(),
});

export type PtzConfigFormData = z.infer<typeof ptzConfigSchema>;
