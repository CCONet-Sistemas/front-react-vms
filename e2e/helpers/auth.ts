import type { Page } from '@playwright/test';
import type { User } from '../../app/types';

export const TEST_TOKENS = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  type: 'Bearer',
  expiresIn: 3600,
};

export const TEST_USER: User = {
  uuid: 'test-user-uuid-1',
  name: 'Test User',
  email: 'test@vms.local',
  groupId: 1,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  roles: {
    name: ['admin'],
    permissions: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:execute',
      'camera:create',
      'camera:read',
      'camera:update',
      'camera:delete',
      'camera:execute',
      'stream:create',
      'stream:read',
      'stream:update',
      'stream:delete',
      'stream:execute',
      'video:create',
      'video:read',
      'video:update',
      'video:delete',
      'video:execute',
      'recording:create',
      'recording:read',
      'recording:update',
      'recording:delete',
      'recording:execute',
      'event:create',
      'event:read',
      'event:update',
      'event:delete',
      'event:execute',
      'notification:create',
      'notification:read',
      'notification:update',
      'notification:delete',
      'notification:execute',
      'configuration:create',
      'configuration:read',
      'configuration:update',
      'configuration:delete',
      'configuration:execute',
      'backup:create',
      'backup:read',
      'backup:update',
      'backup:delete',
      'backup:execute',
      'media_core:create',
      'media_core:read',
      'media_core:update',
      'media_core:delete',
      'media_core:execute',
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      'role:execute',
    ],
  },
};

export async function injectAuthState(page: Page) {
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem(
        'vms-auth-storage',
        JSON.stringify({
          state: {
            user,
            accessToken: token,
            isAuthenticated: true,
          },
          version: 0,
        })
      );
    },
    { user: TEST_USER, token: TEST_TOKENS.accessToken }
  );
}
