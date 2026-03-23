import { z } from 'zod';

export const cameraSchema = z.object({
  // Device Info
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  mode: z.enum(['start', 'stop', 'idle']).default('start'),
  type: z.enum(['rtsp', 'rtmp']).default('rtsp'),
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
      codec: z.enum(['copy', 'h264', 'h265', 'mjpeg', 'mjpeg-low']).optional().default('h264'),
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
  recording: z
    .object({
      vcodec: z.string().default('copy'),
      acodec: z.string().default('no'),
      crf: z.coerce.number().min(0).max(51).default(1),
      cutoff: z.string().default('15'),
      storageDays: z.coerce.number().min(1).max(30).default(7),
    })
    .default({
      vcodec: 'copy',
      acodec: 'no',
      crf: 1,
      cutoff: '15',
      storageDays: 7,
    }),
});

export type CameraFormData = z.infer<typeof cameraSchema>;
