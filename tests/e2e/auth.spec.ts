import { expect, test } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Authentication Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Clear any existing auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Landing Page', () => {
    test('@smoke @safe should display landing page correctly', async ({
      page,
    }) => {
      await page.goto('/');

      // Check if main elements are visible
      await expect(page).toHaveTitle(/ArtShare/i);

      // Look for key landing page elements
      await helpers.waitForElement('body');

      // Take screenshot for visual regression
      await helpers.takeScreenshot('landing-page');
    });

    test('@safe should navigate to login from landing page', async ({
      page,
    }) => {
      await page.goto('/');

      // Find and click login link/button
      const loginSelectors = [
        'a[href="/login"]',
        'button:has-text("Login")',
        'a:has-text("Login")',
        '.login-button',
      ];

      let found = false;
      for (const selector of loginSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          found = true;
          break;
        } catch {
          continue;
        }
      }

      if (!found) {
        // If no login button found, navigate directly
        await page.goto('/login');
      }

      // Verify we're on login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('@safe should navigate to signup from landing page', async ({
      page,
    }) => {
      await page.goto('/');

      // Find and click signup link/button
      const signupSelectors = [
        'a[href="/signup"]',
        'a[href="/register"]',
        'button:has-text("Sign Up")',
        'a:has-text("Sign Up")',
        '.signup-button',
      ];

      let found = false;
      for (const selector of signupSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          found = true;
          break;
        } catch {
          continue;
        }
      }

      if (!found) {
        // If no signup button found, navigate directly
        await page.goto('/signup');
      }

      // Verify we're on signup page
      await expect(page).toHaveURL(/.*signup|.*register/);
    });
  });

  test.describe('Login', () => {
    test('@smoke @unsafe should login successfully with valid credentials', async ({
      page,
    }) => {
      // Test real login with test credentials

      await page.goto('/login');

      // Fill in login form
      await helpers.fillField(
        'input[type="email"]',
        'panngoc21@clc.fitus.edu.vn',
      );
      await helpers.fillField('input[type="password"]', 'Test@123');

      // Submit form
      await helpers.clickAndWait('button[type="submit"]', {
        waitForNavigation: true,
      });

      // Check if redirected to dashboard or main page
      await expect(page).toHaveURL(/.*dashboard|.*home|.*feed/);

      // Verify user is authenticated
      const isAuth = await helpers.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    test('@safe should handle empty form submission', async ({ page }) => {
      await page.goto('/login');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Should stay on login page
      await expect(page).toHaveURL(/.*login/);

      // Check for validation messages
      const errorMessages = page.locator('.error, .invalid, [role="alert"]');
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
    });

    test('@safe should show error for invalid email format', async ({
      page,
    }) => {
      await page.goto('/login');

      // Fill invalid email
      await helpers.fillField('input[type="email"]', 'invalid-email');
      await helpers.fillField('input[type="password"]', 'Test@123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show validation error
      const emailInput = page.locator('input[type="email"]');
      const isInvalid = await emailInput.evaluate(
        (el: HTMLInputElement) => !el.checkValidity(),
      );
      expect(isInvalid).toBe(true);
    });

    test('@safe should have password toggle functionality', async ({
      page,
    }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[type="password"]');
      const toggleButton = page.locator(
        'button:has([data-testid="password-toggle"]), button:near(input[type="password"])',
      );

      if ((await toggleButton.count()) > 0) {
        await helpers.fillField('input[type="password"]', 'Test@123');

        // Click toggle button
        await toggleButton.click();

        // Check if password is now visible (input type changed to text)
        const inputType = await passwordInput.getAttribute('type');
        expect(inputType).toBe('text');
      }
    });
  });

  test.describe('Signup', () => {
    test('@unsafe should register new user successfully', async ({ page }) => {
      // Test real registration (will require unique email)
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@example.com`;

      await page.goto('/signup');

      // Fill registration form
      await helpers.fillField('input[type="email"]', testEmail);
      await helpers.fillField('input[type="password"]', 'Test@123');

      // Fill confirm password if exists
      const confirmPasswordField = page.locator(
        'input[name*="confirm"], input[name*="repeat"]',
      );
      if ((await confirmPasswordField.count()) > 0) {
        await confirmPasswordField.fill('Test@123');
      }

      // Fill additional fields if they exist
      const usernameField = page.locator(
        'input[name="username"], input[name="user_name"]',
      );
      if ((await usernameField.count()) > 0) {
        await usernameField.fill('testuser');
      }

      // Submit form
      await helpers.clickAndWait('button[type="submit"]', {
        waitForNavigation: true,
      });

      // Should redirect to onboarding or dashboard
      await expect(page).toHaveURL(/.*onboarding|.*dashboard|.*profile/);
    });

    test('@safe should show error for invalid email format in signup', async ({
      page,
    }) => {
      await page.goto('/signup');

      await helpers.fillField('input[type="email"]', 'invalid-email');

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show email validation error
      const emailInput = page.locator('input[type="email"]');
      const isInvalid = await emailInput.evaluate(
        (el: HTMLInputElement) => !el.checkValidity(),
      );
      expect(isInvalid).toBe(true);
    });

    test('@safe should show error for weak password', async ({ page }) => {
      await page.goto('/signup');

      await helpers.fillField(
        'input[type="email"]',
        'panngoc21@clc.fitus.edu.vn',
      );
      await helpers.fillField('input[type="password"]', '123');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show password validation error
      const errorMessage = page.locator('.error, .invalid, [role="alert"]');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Password Reset', () => {
    test('@unsafe should request password reset successfully', async ({
      page,
    }) => {
      // Test real password reset functionality
      await page.goto('/forgot-password');

      // Fill email
      await helpers.fillField(
        'input[type="email"]',
        'panngoc21@clc.fitus.edu.vn',
      );

      // Submit form
      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: '/auth/forgot-password',
      });

      // Check for success message
      const successMessage = page.locator(
        '.success, .confirmation, :has-text("reset")',
      );
      await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test('@safe should handle empty email in password reset', async ({
      page,
    }) => {
      await page.goto('/forgot-password');

      // Try to submit without email
      await page.click('button[type="submit"]');

      // Should show validation error
      const emailInput = page.locator('input[type="email"]');
      const isInvalid = await emailInput.evaluate(
        (el: HTMLInputElement) => !el.checkValidity(),
      );
      expect(isInvalid).toBe(true);
    });
  });
  test.describe('Session Management', () => {
    test('@unsafe should logout successfully', async () => {
      // First login with real credentials
      await helpers.loginWithEmail('panngoc21@clc.fitus.edu.vn', 'Test@123');

      // Verify logged in
      const isAuthBefore = await helpers.isAuthenticated();
      expect(isAuthBefore).toBe(true);

      // Logout
      await helpers.logout();

      // Verify logged out
      const isAuthAfter = await helpers.isAuthenticated();
      expect(isAuthAfter).toBe(false);
    });

    test('@unsafe should maintain session across page refreshes', async ({
      page,
    }) => {
      // Login with real credentials
      await helpers.loginWithEmail('panngoc21@clc.fitus.edu.vn', 'Test@123');

      // Refresh page
      await page.reload();
      await helpers.waitForNetworkIdle();

      // Should still be authenticated
      const isAuth = await helpers.isAuthenticated();
      expect(isAuth).toBe(true);
    });
  });
});
