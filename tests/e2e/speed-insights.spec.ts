import { test } from '@playwright/test';

// List all routes you want to test for Speed Insights
// Add dynamic params as example values
const routes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/onboarding',
  '/dashboard',
  '/explore',
  '/posts/51',
  '/blogs',
  '/blogs/3',
  '/search',
];

test.describe('Vercel Speed Insights - All Routes', () => {
  for (const route of routes) {
    test(`Navigate to ${route}`, async ({ page, baseURL }) => {
      await page.goto(baseURL + route);
      // Wait for network to be idle or main content to load
      await page.waitForLoadState('networkidle');
      // Wait for loading spinner to disappear if present
      const loading = page.locator('[data-testid="loading"]');
      if (await loading.count()) {
        await loading.waitFor({ state: 'detached', timeout: 10000 });
      }
    });
  }
});
