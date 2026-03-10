import { test, expect } from '../fixtures';

test.describe('Eventos', () => {
  test('exibir heading e cards de stats', async ({ authenticatedPage: page }) => {
    await page.goto('/events');

    await expect(page.getByRole('heading', { name: 'Eventos' })).toBeVisible();

    // Stats cards
    await expect(page.getByText('Total de Eventos')).toBeVisible();
    await expect(page.getByText('Novos por página')).toBeVisible();
  });

  test('exibir lista de eventos', async ({ authenticatedPage: page }) => {
    await page.goto('/events');

    await expect(page.getByRole('heading', { name: 'Eventos' })).toBeVisible();

    // Aguarda dados carregarem
    await expect(page.getByText('Câmera Entrada')).toBeVisible({ timeout: 5000 });
  });
});
