import { test, expect } from '../fixtures';

test.describe('Eventos', () => {
  test('exibir heading e cards de stats', async ({ authenticatedPage: page }) => {
    await page.goto('/events');
    await page.waitForLoadState('load');

    await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible({
      timeout: 8000,
    });

    // Stats cards
    await expect(page.getByText('Total de Eventos')).toBeVisible();
    await expect(page.getByText('Novos por página')).toBeVisible();
  });

  test('exibir lista de eventos', async ({ authenticatedPage: page }) => {
    await page.goto('/events');
    await page.waitForLoadState('load');

    await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible({
      timeout: 8000,
    });

    // Assert the event loaded by checking the event card text (not the hidden <option> in FilterBar)
    // The event card camera name appears as visible text in a heading/paragraph, not in an option
    await expect(
      page.getByRole('article').getByText('Câmera Entrada').or(
        page.locator('li, [class*="card"]').filter({ hasText: 'Câmera Entrada' }).first()
      )
    ).toBeVisible({ timeout: 8000 });
  });
});
