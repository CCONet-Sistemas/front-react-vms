import { test as base, type Page } from '@playwright/test';
import { injectAuthState } from '../helpers/auth';
import { mockApiRoutes } from '../helpers/mock-api';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup API mocks
    await mockApiRoutes(page);

    // Do actual login through UI (using mocked API)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Email').fill('test@vms.local');
    await page.getByLabel('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Use the authenticated page
    await use(page);
  },
});

export { expect } from '@playwright/test';
