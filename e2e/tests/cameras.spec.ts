import { test, expect } from '../fixtures';

test.describe('Câmeras', () => {
  test('listar câmeras', async ({ authenticatedPage: page }) => {
    await page.goto('/cameras');

    await expect(page.getByRole('heading', { name: 'Câmeras' })).toBeVisible();
    await expect(page.getByText('Câmera Entrada')).toBeVisible();
  });

  test('navegar para formulário de adição ao clicar em Adicionar', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/cameras');

    await page.getByRole('link', { name: 'Adicionar' }).click();

    await expect(page).toHaveURL('/camera');
  });

  test('preencher formulário e criar câmera', async ({ authenticatedPage: page }) => {
    await page.goto('/camera');

    await page.getByLabel('Nome do dispositivo').fill('Câmera Teste E2E');
    await page.getByLabel('Modo').selectOption('start');
    await page.getByLabel('Protocolo').selectOption('rtsp');
    await page.getByLabel('Host').fill('192.168.1.200');
    await page.getByLabel('Porta').fill('554');

    await page.getByRole('button', { name: 'Criar Câmera' }).click();

    await expect(page).toHaveURL(/\/camera\/new-camera-uuid/);
  });
});
