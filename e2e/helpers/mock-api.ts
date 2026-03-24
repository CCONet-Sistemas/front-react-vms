import type { Page } from '@playwright/test';
import { TEST_USER, TEST_TOKENS } from './auth';

const mockCamera = {
  uuid: 'camera-uuid-1',
  externalId: 'ext-001',
  name: 'Câmera Entrada',
  type: 'rtsp',
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

const mockCameraListResponse = {
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

const mockEvent = {
  uuid: 'event-uuid-1',
  cameraUuid: 'camera-uuid-1',
  cameraName: 'Câmera Entrada',
  status: 'new',
  reason: 'motion',
  confidence: 0.95,
  timestamp: '2024-01-01T10:00:00.000Z',
  videos: [],
  createdAt: '2024-01-01T10:00:00.000Z',
};

const mockEventListResponse = {
  data: [mockEvent],
  meta: {
    current_page: 1,
    per_page: 12,
    total: 1,
    last_page: 1,
    from: 1,
    to: 1,
  },
};

export async function mockApiRoutes(page: Page) {
  await page.route('http://localhost:3000/**', async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    const method = route.request().method();

    // Auth endpoints
    if (pathname === '/authentication' && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_TOKENS),
      });
      return;
    }

    if (pathname === '/authentication/refresh' && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'refreshed-test-token' }),
      });
      return;
    }

    if (pathname === '/users/me') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_USER),
      });
      return;
    }

    // Camera endpoints
    if (pathname === '/camera' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCameraListResponse),
      });
      return;
    }

    if (pathname === '/camera' && method === 'POST') {
      let body: Record<string, unknown> = {};
      try {
        body = (route.request().postDataJSON() as Record<string, unknown>) ?? {};
      } catch {
        body = {};
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockCamera,
          uuid: 'new-camera-uuid',
          name: body.name ?? 'Nova Câmera',
        }),
      });
      return;
    }

    if (pathname.startsWith('/camera/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCamera),
      });
      return;
    }

    // Events endpoints
    if (pathname === '/events' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEventListResponse),
      });
      return;
    }

    if (pathname.startsWith('/events/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEvent),
      });
      return;
    }

    // Default: return empty 200 for any other API call
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}
