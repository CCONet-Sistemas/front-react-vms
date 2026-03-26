import { z } from 'zod';

export const cameraSchema = z.object({
  // Device Info
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  mode: z.enum(['start', 'stop', 'idle']).default('start'),
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
      ext: z.string().default('mp4'),
      fps: z.coerce.number().min(1).max(120).optional(),
      codec: z.enum(['copy', 'h264', 'h265', 'mjpeg', 'mjpeg-low']).optional(),
      hwaccel: z
        .object({
          enabled: z.boolean().default(false),
          method: z.string().default(''),
          device: z.string().default(''),
        })
        .optional(),
      stream: z
        .object({
          streamType: z.string().default('hls'),
          flvTransportType: z.string().default('tcp'),
          videoCodec: z.string().default('h264'),
          audioCodec: z.string().default('aac'),
          quality: z.string().optional(),
          fps: z.coerce.number().min(1).max(60).optional(),
        })
        .optional(),
    })
    .optional(),

  recording: z
    .object({
      videoCodec: z.string().default('copy'),
      audioCodec: z.string().default('no'),
      crf: z.coerce.number().min(0).max(51).default(1),
      segmentDuration: z.coerce.number().min(1).max(60).default(15),
      retentionDays: z.coerce.number().min(1).max(365).default(7),
    })
    .default({
      videoCodec: 'copy',
      audioCodec: 'no',
      crf: 1,
      segmentDuration: 15,
      retentionDays: 7,
    }),
});

export type CameraFormData = z.infer<typeof cameraSchema>;
export type CameraFormInput = z.input<typeof cameraSchema>;
