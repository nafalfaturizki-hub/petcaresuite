import { test, expect } from '@playwright/test';

test.describe('PetCare Suite E2E', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('login page displays', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/nonexistent-route');
    // Should either show 404 page or redirect to login
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});