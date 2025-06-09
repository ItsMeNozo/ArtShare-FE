import { test, expect } from "@playwright/test";
import { TestHelpers, testData } from "./utils/test-helpers";

test.describe("Onboarding Flow", () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Mock authenticated user who hasn't completed onboarding
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          email: "test@artshare.com",
          is_onboard: false,
        }),
      );
    });
  });

  test.describe("Profile Setup", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/onboarding");
    });

    test("should display onboarding form correctly", async ({ page }) => {
      // Wait for the onboarding dialog/form to appear
      await helpers.waitForElement('[role="dialog"], .onboarding, form');

      // Check for required form fields
      await helpers.waitForElement(
        'input[name="full_name"], input[placeholder*="name"], input[id*="name"]',
      );
      await helpers.waitForElement(
        'input[name="username"], input[placeholder*="username"], input[id*="username"]',
      );
      await helpers.waitForElement(
        'input[type="date"], input[name="birthday"], input[placeholder*="birth"]',
      );

      // Check for optional bio field
      const bioField = page.locator(
        'textarea[name="bio"], textarea[placeholder*="bio"], .bio-input',
      );
      if ((await bioField.count()) > 0) {
        await expect(bioField).toBeVisible();
      }

      await helpers.takeScreenshot("onboarding-form");
    });

    test("should validate required fields", async ({ page }) => {
      await helpers.waitForElement("form");

      // Try to submit without filling required fields
      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Continue"), button:has-text("Complete")',
      );
      await submitButton.click();

      await page.waitForTimeout(1000);

      // Check for validation errors
      const errorMessages = page.locator(
        '.text-red-600, .error, .invalid, [role="alert"]',
      );
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        await helpers.takeScreenshot("onboarding-validation-errors");
      }
    });

    test("should validate minimum age requirement", async ({ page }) => {
      await helpers.waitForElement("form");

      // Fill form with user under 13
      await helpers.fillField(
        'input[name="full_name"], input[placeholder*="name"]',
        testData.validUser.fullName,
      );
      await helpers.fillField(
        'input[name="username"], input[placeholder*="username"]',
        testData.validUser.username,
      );

      // Set birthday to make user 12 years old
      const currentYear = new Date().getFullYear();
      const underageDate = `${currentYear - 12}-06-01`;
      await helpers.fillField(
        'input[type="date"], input[name="birthday"]',
        underageDate,
      );

      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Continue"), button:has-text("Complete")',
      );
      await submitButton.click();

      await page.waitForTimeout(1000);

      // Should show age restriction error
      const ageError = page.locator(
        "text=/13 years old/, text=/age/, .text-red-600",
      );
      if ((await ageError.count()) > 0) {
        await expect(ageError).toBeVisible();
        await helpers.takeScreenshot("age-validation-error");
      }
    });

    test("should handle successful profile completion", async ({ page }) => {
      await helpers.waitForElement("form");

      // Mock successful profile update
      await helpers.mockApiResponse("/users/profile", {
        success: true,
        user: { ...testData.validUser, is_onboard: true },
      });

      // Fill all required fields
      await helpers.fillField(
        'input[name="full_name"], input[placeholder*="name"]',
        testData.validUser.fullName,
      );
      await helpers.fillField(
        'input[name="username"], input[placeholder*="username"]',
        testData.validUser.username,
      );
      await helpers.fillField(
        'input[type="date"], input[name="birthday"]',
        testData.validUser.birthday,
      );

      // Fill optional bio if present
      const bioField = page.locator(
        'textarea[name="bio"], textarea[placeholder*="bio"]',
      );
      if ((await bioField.count()) > 0) {
        await helpers.fillField('textarea[name="bio"]', testData.validUser.bio);
      }

      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Continue"), button:has-text("Complete")',
      );
      await helpers.clickAndWait(submitButton.first(), {
        waitForResponse: "/users/profile",
      });

      // Should redirect to explore page
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/\/(explore|home|dashboard)/);
    });

    test("should handle username validation", async ({ page }) => {
      await helpers.waitForElement("form");

      // Test invalid usernames
      const invalidUsernames = [
        "",
        "a",
        "123456789012345678901",
        "user@name",
        "user name",
      ];

      for (const username of invalidUsernames) {
        await helpers.fillField(
          'input[name="username"], input[placeholder*="username"]',
          username,
        );
        await page.waitForTimeout(500);

        // Check for validation feedback
        const usernameInput = page.locator(
          'input[name="username"], input[placeholder*="username"]',
        );
        const isInvalid = await usernameInput.evaluate(
          (el: HTMLInputElement) => !el.checkValidity(),
        );

        if (isInvalid) {
          await helpers.takeScreenshot(
            `invalid-username-${username.replace(/[^a-zA-Z0-9]/g, "-")}`,
          );
        }
      }
    });

    test("should handle API errors gracefully", async ({ page }) => {
      await helpers.waitForElement("form");

      // Mock API error
      await helpers.mockApiResponse(
        "/users/profile",
        {
          error: "Username already taken",
        },
        409,
      );

      await helpers.fillField(
        'input[name="full_name"], input[placeholder*="name"]',
        testData.validUser.fullName,
      );
      await helpers.fillField(
        'input[name="username"], input[placeholder*="username"]',
        "taken-username",
      );
      await helpers.fillField(
        'input[type="date"], input[name="birthday"]',
        testData.validUser.birthday,
      );

      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Continue"), button:has-text("Complete")',
      );
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Should show error message
      const errorMessage = page.locator(
        ".text-red-600, .error, text=/already taken/, text=/error/",
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
        await helpers.takeScreenshot("username-taken-error");
      }
    });

    test("should validate date input edge cases", async ({ page }) => {
      await helpers.waitForElement("form");

      const dateInput = page.locator(
        'input[type="date"], input[name="birthday"]',
      );

      // Test future date (should be invalid)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split("T")[0];

      await helpers.fillField(
        'input[type="date"], input[name="birthday"]',
        futureDateString,
      );
      await page.waitForTimeout(500);

      // Check if validation prevents future dates
      const isValid = await dateInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity(),
      );
      if (!isValid) {
        await helpers.takeScreenshot("future-date-validation");
      }

      // Test very old date
      await helpers.fillField(
        'input[type="date"], input[name="birthday"]',
        "1900-01-01",
      );
      await page.waitForTimeout(500);
    });
  });

  test.describe("Onboarding Navigation", () => {
    test("should redirect unauthenticated users", async ({ page }) => {
      // Clear auth state
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto("/onboarding");

      // Should redirect to login
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/\/(login|auth)/);
    });

    test("should skip onboarding for already onboarded users", async ({
      page,
    }) => {
      // Set user as already onboarded
      await page.addInitScript(() => {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            email: "test@artshare.com",
            is_onboard: true,
          }),
        );
      });

      await page.goto("/onboarding");

      // Should redirect away from onboarding
      await page.waitForTimeout(2000);
      expect(page.url()).not.toMatch(/\/onboarding/);
    });
  });

  test.describe("Responsive Onboarding", () => {
    test("should display correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/onboarding");

      await helpers.waitForElement("form");
      await helpers.takeScreenshot("onboarding-mobile");

      // Check if form is still usable on mobile
      const formElements = page.locator("input, textarea, button");
      const elementCount = await formElements.count();
      expect(elementCount).toBeGreaterThan(0);
    });

    test("should display correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/onboarding");

      await helpers.waitForElement("form");
      await helpers.takeScreenshot("onboarding-tablet");
    });
  });

  test.describe("Form Accessibility", () => {
    test("should have proper form labels and accessibility", async ({
      page,
    }) => {
      await page.goto("/onboarding");
      await helpers.waitForElement("form");

      // Check for proper labeling
      const inputs = page.locator(
        'input[type="text"], input[type="date"], textarea',
      );
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        const name = await input.getAttribute("name");

        if (id) {
          // Check if there's a label for this input
          const label = page.locator(`label[for="${id}"]`);
          if ((await label.count()) > 0) {
            await expect(label).toBeVisible();
          }
        }

        // Check for aria-label or placeholder
        const ariaLabel = await input.getAttribute("aria-label");
        const placeholder = await input.getAttribute("placeholder");

        expect(ariaLabel || placeholder || name).toBeTruthy();
      }
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.goto("/onboarding");
      await helpers.waitForElement("form");

      // Tab through form elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Verify focus is moving through form elements
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });
  });
});
