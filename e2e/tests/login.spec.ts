import { test, expect } from '@playwright/test';
import { mockApiRoutes } from '../helpers/mock-api';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test('preencher credenciais e redirecionar para /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('load');

    await page.getByLabel('Email').fill('test@vms.local');
    await page.getByLabel('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('exibir erro com credenciais inválidas', async ({ page }) => {
    await page.route('http://localhost:3000/authentication', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('load');

    await page.getByLabel('Email').fill('wrong@vms.local');
    await page.getByLabel('Senha').fill('wrongpassword');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 5000 });
  });
});
