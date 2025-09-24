import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display version badge', async ({ page }) => {
    await page.goto('/');
    
    // Check that the version badge is visible
    const versionBadge = page.locator('[data-testid="version-badge"]');
    await expect(versionBadge).toBeVisible();
    
    // Check that it contains the version text
    await expect(versionBadge).toContainText('v0.1.0');
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links
    await expect(page.locator('a[href="/changelog"]')).toBeVisible();
    await expect(page.locator('a[href="/settings"]')).toBeVisible();
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Welcome to Shiekh Supply S3');
  });
});
