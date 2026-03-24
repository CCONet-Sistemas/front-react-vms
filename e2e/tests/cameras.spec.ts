import { test, expect } from '../fixtures';

test.describe('Câmeras', () => {
  test('listar câmeras', async ({ authenticatedPage: page }) => {
    await page.goto('/cameras');
    await page.waitForLoadState('load');

    await expect(page.getByRole('heading', { name: 'Câmeras' })).toBeVisible();
    await expect(page.getByText('Câmera Entrada')).toBeVisible();
  });

  test('navegar para formulário de adição ao clicar em Adicionar', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/cameras');
    await page.waitForLoadState('load');

    await page.getByRole('link', { name: 'Adicionar' }).click();

    await expect(page).toHaveURL('/camera');
  });

  test('editar câmera existente', async ({ authenticatedPage: page }) => {
    // Wait for the API response
    const cameraPromise = page.waitForResponse(
      (response) => response.url().includes('/camera/camera-uuid-1') && response.status() === 200
    );

    await page.goto('/camera/camera-uuid-1');
    await cameraPromise;
    await page.waitForLoadState('networkidle');

    // Wait for the camera form to load with data (edit mode)
    const nameInput = page.getByLabel('Nome do dispositivo');

    // First ensure the input is visible
    await expect(nameInput).toBeVisible({ timeout: 8000 });

    // Then check if it has the correct value
    await expect(nameInput).toHaveValue('Câmera Entrada', { timeout: 8000 });

    // Update the name
    await nameInput.fill('Câmera Atualizada E2E');

    // Submit the update
    await page.getByRole('button', { name: 'Atualizar' }).click();

    // Verify the success toast
    await expect(page.getByText('Câmera atualizada com sucesso!')).toBeVisible({ timeout: 8000 });
  });
});
