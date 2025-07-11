import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5173' });

test('homepage should have welcome text', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/vite/i);
});
