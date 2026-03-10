import { test as base, type Page } from '@playwright/test';
import { injectAuthState } from '../helpers/auth';
import { mockApiRoutes } from '../helpers/mock-api';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await injectAuthState(page);
    await mockApiRoutes(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
