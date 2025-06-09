import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Authentication Regression Tests", () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Clear any existing auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
  test.describe("Complete Registration Flow", () => {
    test("@smoke should handle complete signup with email verification flow", async ({
      page,
    }) => {
      // Step 1: Navigate to signup page
      await page.goto("/signup");
      await helpers.waitForElement("form");

      // Step 2: Fill signup form with valid data
      const testEmail = `test${Date.now()}@artshare.com`;
      await helpers.mockApiResponse("/auth/signup", {
        success: true,
        message: "Verification email sent",
        token: "verification-token",
      });

      await helpers.fillField('input[type="email"]', testEmail);
      await helpers.fillField('input[type="password"]', "TestPassword123!");
      await helpers.fillField(
        'input[name="confirmPassword"]',
        "TestPassword123!",
      );

      // Step 3: Submit form
      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/signup",
      });

      // Step 4: Verify redirect to activation page
      await expect(page).toHaveURL(/\/activate-account/);
      await expect(page.locator("text=Check your email")).toBeVisible();

      // Step 5: Mock email verification
      await helpers.mockApiResponse("/auth/activate/**", {
        success: true,
        user: {
          id: 1,
          email: testEmail,
          is_onboard: false,
          is_verified: true,
        },
        token: "auth-token-123",
      });

      // Simulate clicking verification link
      await page.goto("/activate-account/mock-token");

      // Step 6: Should redirect to onboarding
      await expect(page).toHaveURL(/\/onboarding/);

      await helpers.takeScreenshot("signup-flow-complete");
    });

    test("should handle signup with invalid email format", async ({ page }) => {
      await page.goto("/signup");
      await helpers.waitForElement("form");

      await helpers.fillField('input[type="email"]', "invalid-email");
      await helpers.fillField('input[type="password"]', "TestPassword123!");

      // Should show validation error
      await page.click('button[type="submit"]');
      await expect(page.locator("text=Invalid email format")).toBeVisible();
    });

    test("should handle signup with weak password", async ({ page }) => {
      await page.goto("/signup");
      await helpers.waitForElement("form");

      await helpers.fillField('input[type="email"]', "test@example.com");
      await helpers.fillField('input[type="password"]', "123");

      // Should show password validation error
      await page.click('button[type="submit"]');
      await expect(
        page.locator("text=Password must be at least"),
      ).toBeVisible();
    });

    test("should handle signup with existing email", async ({ page }) => {
      await page.goto("/signup");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse(
        "/auth/signup",
        {
          success: false,
          error: "Email already exists",
        },
        400,
      );

      await helpers.fillField('input[type="email"]', "existing@example.com");
      await helpers.fillField('input[type="password"]', "TestPassword123!");

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/signup",
      });

      await expect(page.locator("text=Email already exists")).toBeVisible();
    });
  });

  test.describe("Login Flow", () => {
    test("@smoke should handle successful login and redirect to dashboard", async ({
      page,
    }) => {
      await page.goto("/login");
      await helpers.waitForElement("form");

      // Mock successful login
      await helpers.mockApiResponse("/auth/login", {
        success: true,
        user: {
          id: 1,
          email: "test@artshare.com",
          username: "testuser",
          is_onboard: true,
          is_verified: true,
        },
        token: "auth-token-123",
      });

      await helpers.fillField('input[type="email"]', "test@artshare.com");
      await helpers.fillField('input[type="password"]', "TestPassword123!");

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/login",
      });

      // Should redirect to dashboard after successful login
      await expect(page).toHaveURL(/\/(dashboard|explore|home)/);
      await expect(helpers.isAuthenticated()).resolves.toBe(true);
    });

    test("should handle login with invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse(
        "/auth/login",
        {
          success: false,
          error: "Invalid credentials",
        },
        401,
      );

      await helpers.fillField('input[type="email"]', "test@artshare.com");
      await helpers.fillField('input[type="password"]', "wrongpassword");

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/login",
      });

      await expect(page.locator("text=Invalid credentials")).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    });

    test("should handle login redirect for unverified user", async ({
      page,
    }) => {
      await page.goto("/login");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse(
        "/auth/login",
        {
          success: false,
          error: "Email not verified",
          redirect: "/activate-account",
        },
        403,
      );

      await helpers.fillField('input[type="email"]', "unverified@artshare.com");
      await helpers.fillField('input[type="password"]', "TestPassword123!");

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/login",
      });

      await expect(page).toHaveURL(/\/activate-account/);
    });

    test("should handle login redirect for non-onboarded user", async ({
      page,
    }) => {
      await page.goto("/login");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse("/auth/login", {
        success: true,
        user: {
          id: 1,
          email: "test@artshare.com",
          is_onboard: false,
          is_verified: true,
        },
        token: "auth-token-123",
      });

      await helpers.fillField('input[type="email"]', "test@artshare.com");
      await helpers.fillField('input[type="password"]', "TestPassword123!");

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/login",
      });

      await expect(page).toHaveURL(/\/onboarding/);
    });
  });

  test.describe("Password Reset Flow", () => {
    test("should handle complete password reset flow", async ({ page }) => {
      // Step 1: Navigate to forgot password
      await page.goto("/forgot-password");
      await helpers.waitForElement("form");

      // Step 2: Submit email for password reset
      await helpers.mockApiResponse("/auth/forgot-password", {
        success: true,
        message: "Password reset email sent",
      });

      await helpers.fillField('input[type="email"]', "test@artshare.com");
      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/forgot-password",
      });

      await expect(
        page.locator("text=Password reset email sent"),
      ).toBeVisible();

      // Step 3: Navigate to reset password page (simulate email link)
      await page.goto("/reset-password/mock-reset-token");
      await helpers.waitForElement("form");

      // Step 4: Set new password
      await helpers.mockApiResponse("/auth/reset-password", {
        success: true,
        message: "Password reset successfully",
      });

      await helpers.fillField('input[type="password"]', "NewPassword123!");
      await helpers.fillField(
        'input[name="confirmPassword"]',
        "NewPassword123!",
      );

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/reset-password",
      });

      // Step 5: Should redirect to login with success message
      await expect(page).toHaveURL(/\/login/);
      await expect(
        page.locator("text=Password reset successfully"),
      ).toBeVisible();
    });

    test("should handle invalid reset token", async ({ page }) => {
      await page.goto("/reset-password/invalid-token");

      await expect(
        page.locator("text=Invalid or expired reset token"),
      ).toBeVisible();

      // Should provide link back to forgot password
      const forgotPasswordLink = page.locator('a[href="/forgot-password"]');
      await expect(forgotPasswordLink).toBeVisible();
    });
  });

  test.describe("Session Management", () => {
    test("should handle token expiration gracefully", async ({ page }) => {
      // Mock authenticated user
      await page.addInitScript(() => {
        localStorage.setItem("auth_token", "expired-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            email: "test@artshare.com",
            username: "testuser",
            is_onboard: true,
          }),
        );
      });

      // Mock API response with 401 for expired token
      await helpers.mockApiResponse(
        "/posts",
        {
          error: "Token expired",
        },
        401,
      );

      await page.goto("/dashboard");

      // Should redirect to login when token is expired
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator("text=Session expired")).toBeVisible();
    });

    test("should handle logout functionality", async ({ page }) => {
      // Mock authenticated user
      await page.addInitScript(() => {
        localStorage.setItem("auth_token", "valid-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            email: "test@artshare.com",
            username: "testuser",
            is_onboard: true,
          }),
        );
      });

      await page.goto("/dashboard");

      // Mock logout API call
      await helpers.mockApiResponse("/auth/logout", {
        success: true,
      });

      await helpers.logout();

      // Should redirect to landing page and clear auth state
      await expect(page).toHaveURL(/\/(|login|home)/);
      await expect(helpers.isAuthenticated()).resolves.toBe(false);

      // Verify local storage is cleared
      const authToken = await page.evaluate(() =>
        localStorage.getItem("auth_token"),
      );
      expect(authToken).toBeNull();
    });

    test('should remember user preference for "Remember Me"', async ({
      page,
    }) => {
      await page.goto("/login");
      await helpers.waitForElement("form");

      // Check remember me option
      const rememberMeCheckbox = page.locator('input[type="checkbox"]');
      if ((await rememberMeCheckbox.count()) > 0) {
        await rememberMeCheckbox.check();
      }

      await helpers.mockApiResponse("/auth/login", {
        success: true,
        user: {
          id: 1,
          email: "test@artshare.com",
          username: "testuser",
          is_onboard: true,
        },
        token: "long-lived-token",
        remember: true,
      });

      await helpers.fillField('input[type="email"]', "test@artshare.com");
      await helpers.fillField('input[type="password"]', "TestPassword123!");

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/login",
      });

      // Verify persistent storage is used
      const rememberFlag = await page.evaluate(() =>
        localStorage.getItem("remember_me"),
      );
      expect(rememberFlag).toBeTruthy();
    });
  });
});
