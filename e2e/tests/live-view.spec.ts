import { test, expect } from '../fixtures';

test.describe('Visualização ao Vivo', () => {
  test('exibir heading e mosaic toolbar', async ({ authenticatedPage: page }) => {
    await page.goto('/live-view');
    await page.waitForLoadState('load');

    await expect(page.getByRole('heading', { name: 'Visualização ao Vivo' })).toBeVisible();

    // MosaicToolbar deve estar presente — "Configurar" button
    await expect(page.getByRole('button', { name: 'Configurar' })).toBeVisible();
  });

  test('exibir câmeras no mosaico após carregamento', async ({ authenticatedPage: page }) => {
    await page.goto('/live-view');
    await page.waitForLoadState('load');

    await expect(page.getByRole('heading', { name: 'Visualização ao Vivo' })).toBeVisible();
    // Loading state should not persist
    await expect(page.getByText('Carregando câmeras...')).not.toBeVisible({ timeout: 8000 });
  });
});
