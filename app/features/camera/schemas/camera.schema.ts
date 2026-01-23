import { z } from 'zod';

export const cameraSchema = z.object({
  // Device Info
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  mode: z.enum(['start', 'stop', 'idle']).default('start'),
  type: z.string().default('h264'),
  protocol: z.string().default('rtsp'),
  status: z.enum(['active', 'inactive', 'recording']).default('recording'),

  // Connection
  connection: z.object({
    host: z.string().min(1, 'Host é obrigatório'),
    port: z.coerce.number().min(1).max(65535, 'Porta deve estar entre 1 e 65535'),
    username: z.string().optional(),
    password: z.string().optional(),
    path: z.string().default('/'),
    protocol: z.string().default('rtsp'),
    auto_host_enable: z.boolean().default(false),
    auto_host: z.string().default(''),
    rtsp_transport: z.enum(['tcp', 'udp', 'http', 'multicast']).optional().default('tcp'),
  }),

  // Video (opcional para criação)
  video: z
    .object({
      fps: z.coerce.number().min(1).max(120).optional(),
      width: z.coerce.number().min(1).optional(),
      height: z.coerce.number().min(1).optional(),
      codec: z.string().optional().default('h264_cuvid'),
      ext: z.string().default('mp4'),
    })
    .optional(),

  // Stream (opcional para criação)
  stream: z
    .object({
      fps: z.coerce.number().min(1).max(60).optional(),
      scale: z
        .object({
          x: z.coerce.number().min(1).optional(),
          y: z.coerce.number().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type CameraFormData = z.infer<typeof cameraSchema>;
