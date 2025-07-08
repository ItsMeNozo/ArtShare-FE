import { expect, test } from '@playwright/test';

test.describe('Pipeline Test Verification', () => {
  test('@safe should pass - basic functionality test', async ({ page }) => {
    await page.goto('/');

    // This should pass - basic page load
    await expect(page).toHaveTitle(/ArtShare/i);
    console.log('✅ Safe test passed successfully');
  });

  test('@unsafe should pass - preview environment test', async ({ page }) => {
    await page.goto('/');

    // This should pass in preview environment
    await expect(page.locator('body')).toBeVisible();
    console.log('✅ Unsafe test passed successfully');
  });

  // Temporarily disabled - uncomment to test pipeline failure
  // test('@safe should fail - intentional failure test', async ({ page }) => {
  //   await page.goto('/');
  //
  //   // This will intentionally fail to test pipeline failure
  //   await expect(page).toHaveTitle('This Title Does Not Exist');
  //   console.log('❌ This should never be reached');
  // });
});
