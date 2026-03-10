import { http, HttpResponse } from 'msw';
import type { Camera, CameraListResponse } from '~/types';

const BASE_URL = 'http://localhost:3000';

export const mockCamera: Camera = {
  uuid: 'camera-uuid-1',
  externalId: 'ext-001',
  name: 'Câmera Entrada',
  type: 'ip',
  protocol: 'rtsp',
  mode: 'stop',
  status: 'stopped',
  connection: {
    host: '192.168.1.100',
    port: 554,
    path: '/stream1',
    protocol: 'rtsp',
    username: 'admin',
    password: 'pass',
    auto_host_enable: false,
    auto_host: '',
    rtsp_transport: 'tcp',
    isP2pEnabled: false,
    p2pSerialNumber: '',
  },
  video: {
    ext: 'mp4',
    fps: 15,
    width: 1920,
    height: 1080,
    codec: 'h264',
    hwaccel: { enabled: false, method: '', device: '' },
    stream: {
      type: 'hls',
      flv_type: '',
      vcodec: 'h264',
      acodec: 'aac',
      quality: 23,
      fps: 15,
      scale: { x: 1920, y: 1080 },
    },
    snapshot: { enabled: true, fps: 1, scale: { x: 640, y: 360 } },
  },
  recording: {
    vcodec: 'h264',
    acodec: 'aac',
    crf: 23,
    cutoff: '01:00:00',
    storageDays: 30,
    watermark: { enabled: false, location: '', position: '' },
  },
  control: {
    enabled: false,
    base_url: '',
    commands: { left: '', right: '', up: '', down: '', zoom_in: '', zoom_out: '' },
  },
  logs: { level: 'info', sql_log: false },
  images: [],
  metadata: { groups: [], notes: '' },
  streamStatus: {
    state: 'stopped',
    isHealthy: false,
    fps: '0.00',
    bitrate: 0,
    resolutionWidth: 0,
    resolutionHeight: 0,
    latencyMs: null,
    lastFrameAt: null,
    lastHealthCheckAt: null,
    retryCount: 0,
    lastError: null,
    startedAt: null,
    stoppedAt: null,
  },
  stream: {
    type: 'hls',
    flv_type: '',
    vcodec: 'h264',
    acodec: 'aac',
    quality: 23,
    fps: 15,
    scale: { x: 1920, y: 1080 },
  },
};

export const mockCameraListResponse: CameraListResponse = {
  data: [mockCamera],
  meta: {
    current_page: 1,
    per_page: 10,
    total: 1,
    last_page: 1,
    from: 1,
    to: 1,
  },
};

export const cameraHandlers = [
  http.get(`${BASE_URL}/camera`, () => {
    return HttpResponse.json(mockCameraListResponse);
  }),

  http.get(`${BASE_URL}/camera/:uuid`, ({ params }) => {
    return HttpResponse.json({ ...mockCamera, uuid: params.uuid as string });
  }),

  http.post(`${BASE_URL}/camera`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newCamera: Camera = {
      ...mockCamera,
      uuid: 'new-camera-uuid',
      name: (body.name as string) ?? 'Nova Câmera',
    };
    return HttpResponse.json(newCamera, { status: 201 });
  }),

  http.put(`${BASE_URL}/camera/:uuid`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...mockCamera,
      uuid: params.uuid as string,
      name: (body.name as string) ?? mockCamera.name,
    });
  }),

  http.delete(`${BASE_URL}/camera/:uuid`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE_URL}/camera/:uuid/start`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE_URL}/camera/:uuid/stop`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
