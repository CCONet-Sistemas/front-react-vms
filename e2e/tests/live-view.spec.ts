import { test, expect } from '../fixtures';

test.describe('Visualização ao Vivo', () => {
  test('exibir heading e mosaic toolbar', async ({ authenticatedPage: page }) => {
    await page.goto('/live-view');

    await expect(page.getByRole('heading', { name: 'Visualização ao Vivo' })).toBeVisible();

    // MosaicToolbar deve estar presente
    await expect(page.getByRole('button', { name: /Configurar|Config/i }).first()).toBeVisible();
  });

  test('exibir câmeras no mosaico após carregamento', async ({ authenticatedPage: page }) => {
    await page.goto('/live-view');

    // Aguarda o carregamento e a exibição do mosaico
    await expect(page.getByRole('heading', { name: 'Visualização ao Vivo' })).toBeVisible();
    await expect(page.getByText('Carregando câmeras...')).not.toBeVisible({ timeout: 5000 });
  });
});
