import { test, expect } from '@playwright/test';
import { mockApiRoutes } from '../helpers/mock-api';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test('preencher credenciais e redirecionar para /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Email').fill('test@vms.local');
    await page.getByLabel('Senha').fill('password123');

    const navigationPromise = page.waitForURL('/dashboard', { timeout: 10000 });
    await page.getByRole('button', { name: 'Entrar' }).click();
    await navigationPromise;

    await expect(page).toHaveURL('/dashboard');
  });

  test('exibir erro com credenciais inválidas', async ({ page }) => {
    // Setup base mocks first
    await mockApiRoutes(page);

    // Then override authentication to return 401
    await page.route(
      (url) => url.pathname === '/authentication' && url.searchParams.get('override') !== 'true',
      async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Unauthorized' }),
          });
        } else {
          await route.continue();
        }
      }
    );

    await page.goto('/login');
    await page.waitForLoadState('load');

    await page.getByLabel('Email').fill('wrong@vms.local');
    await page.getByLabel('Senha').fill('wrongpassword');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 5000 });
  });
});
