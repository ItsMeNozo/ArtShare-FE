import { test, expect } from "@playwright/test";
import { TestHelpers } from "./utils/test-helpers";

test.describe("Performance & Accessibility Tests", () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe("Performance Tests", () => {
    test("should load landing page within acceptable time", async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto("/");
      await helpers.waitForNetworkIdle();

      const loadTime = Date.now() - startTime;
      console.log(`Landing page load time: ${loadTime}ms`);

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      await helpers.takeScreenshot("performance-landing");
    });

    test("should handle large image galleries efficiently", async ({
      page,
    }) => {
      // Mock large dataset
      const largePosts = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Art Piece ${i + 1}`,
        image_url: `https://picsum.photos/400/400?random=${i}`,
        author: { username: `artist${i}` },
        likes_count: Math.floor(Math.random() * 100),
      }));

      await helpers.mockApiResponse("/posts", {
        data: largePosts.slice(0, 20),
        pagination: { has_more: true },
      });

      const startTime = Date.now();
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      const loadTime = Date.now() - startTime;
      console.log(`Gallery load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(8000);
    });

    test("should maintain performance during scroll", async ({ page }) => {
      await helpers.mockApiResponse("/posts", {
        data: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          title: `Art ${i + 1}`,
          image_url: `https://picsum.photos/400/400?random=${i}`,
        })),
      });

      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Measure scroll performance
      const scrollStartTime = Date.now();

      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(100);
      }

      const scrollTime = Date.now() - scrollStartTime;
      console.log(`Scroll performance: ${scrollTime}ms for 10 scrolls`);

      // Should maintain smooth scrolling
      expect(scrollTime).toBeLessThan(3000);
    });

    test("should handle concurrent API calls efficiently", async ({ page }) => {
      // Simulate multiple concurrent requests
      await Promise.all([
        helpers.mockApiResponse("/posts", { data: [] }),
        helpers.mockApiResponse("/categories", { data: [] }),
        helpers.mockApiResponse("/users/profile", { data: {} }),
        helpers.mockApiResponse("/notifications", { data: [] }),
      ]);

      const startTime = Date.now();
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(6000);
    });

    test("should optimize image loading", async ({ page }) => {
      await page.goto("/explore");

      // Check if images are lazy loaded
      const images = page.locator("img");
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Check for lazy loading attributes
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          const loading = await img.getAttribute("loading");
          const dataSrc = await img.getAttribute("data-src");

          // Should have lazy loading or data-src for lazy loading
          if (i > 2) {
            // First few images might not be lazy loaded
            expect(loading === "lazy" || dataSrc !== null).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe("Accessibility Tests", () => {
    test("should have proper heading structure", async ({ page }) => {
      await page.goto("/");
      await helpers.waitForNetworkIdle();

      // Check heading hierarchy
      const headings = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .allTextContents();
      expect(headings.length).toBeGreaterThan(0);

      // Should have at least one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      await helpers.takeScreenshot("accessibility-headings");
    });

    test("should have proper alt text for images", async ({ page }) => {
      await helpers.mockApiResponse("/posts", {
        data: [
          {
            id: 1,
            title: "Test Art",
            image_url: "https://example.com/art.jpg",
            description: "Beautiful artwork",
          },
        ],
      });

      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      const images = page.locator("img");
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        const ariaLabel = await img.getAttribute("aria-label");

        // Image should have alt text or aria-label
        expect(alt || ariaLabel).toBeTruthy();

        // Alt text should not be just filename
        if (alt) {
          expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|svg)$/i);
        }
      }
    });

    test("should have keyboard navigation support", async ({ page }) => {
      await page.goto("/login");
      await helpers.waitForNetworkIdle();

      // Test tab navigation through form
      await page.keyboard.press("Tab");
      let focusedElement = await page.locator(":focus").elementHandle();
      expect(focusedElement).toBeTruthy();

      await page.keyboard.press("Tab");
      focusedElement = await page.locator(":focus").elementHandle();
      expect(focusedElement).toBeTruthy();

      await page.keyboard.press("Tab");
      focusedElement = await page.locator(":focus").elementHandle();
      expect(focusedElement).toBeTruthy();

      // Test Enter key on submit button
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.focus();
      await page.keyboard.press("Enter");

      await page.waitForTimeout(1000);
    });

    test("should have proper form labels", async ({ page }) => {
      await page.goto("/login");
      await helpers.waitForNetworkIdle();

      const inputs = page.locator(
        'input[type="email"], input[type="password"], input[type="text"]',
      );
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = (await label.count()) > 0;

          // Input should have a label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/");
      await helpers.waitForNetworkIdle();

      // This is a basic check - in practice you'd use axe-core for thorough testing
      const textElements = page.locator(
        "p, h1, h2, h3, h4, h5, h6, span, a, button",
      );
      const elementCount = await textElements.count();

      expect(elementCount).toBeGreaterThan(0);

      // Check for any obviously problematic color combinations
      const redOnRed = page.locator(
        '[style*="color: red"][style*="background: red"]',
      );
      const redOnRedCount = await redOnRed.count();
      expect(redOnRedCount).toBe(0);
    });

    test("should support screen readers", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Check for ARIA landmarks
      const main = page.locator('main, [role="main"]');
      const nav = page.locator('nav, [role="navigation"]');
      const header = page.locator('header, [role="banner"]');

      const hasLandmarks =
        (await main.count()) > 0 ||
        (await nav.count()) > 0 ||
        (await header.count()) > 0;
      expect(hasLandmarks).toBeTruthy();

      // Check for skip links (optional but good for accessibility)
      // Skip links are optional but good for accessibility
    });

    test("should handle focus management in modals", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Find and open a modal if available
      const modalTrigger = page.locator(
        'button:has-text("Create"), button[aria-haspopup="dialog"]',
      );

      if ((await modalTrigger.count()) > 0) {
        await modalTrigger.first().click();
        await page.waitForTimeout(1000);

        const modal = page.locator('[role="dialog"], .modal');
        if ((await modal.count()) > 0) {
          // Focus should be trapped in modal
          await page.keyboard.press("Tab");
          const focusedInModal = (await modal.locator(":focus").count()) > 0;

          // Focus should be within the modal
          expect(focusedInModal).toBeTruthy();

          // Escape should close modal
          await page.keyboard.press("Escape");
          await page.waitForTimeout(500);

          const modalStillVisible = await modal.isVisible();
          expect(modalStillVisible).toBeFalsy();
        }
      }
    });

    test("should have proper button states", async ({ page }) => {
      await page.goto("/login");
      await helpers.waitForNetworkIdle();

      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);

        // Check if button has accessible name
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        const title = await button.getAttribute("title");

        expect(text?.trim() || ariaLabel || title).toBeTruthy();

        // Check if disabled state is properly indicated
        const isDisabled = await button.isDisabled();
        const ariaDisabled = await button.getAttribute("aria-disabled");

        if (isDisabled || ariaDisabled === "true") {
          // Disabled buttons should not be focusable unless aria-disabled is used
          if (ariaDisabled !== "true") {
            const tabindex = await button.getAttribute("tabindex");
            expect(tabindex).toBe("-1");
          }
        }
      }
    });
  });

  test.describe("Browser Compatibility", () => {
    test("should work correctly in different browsers", async ({
      page,
      browserName,
    }) => {
      await page.goto("/");
      await helpers.waitForNetworkIdle();

      // Basic functionality should work across browsers
      const isPageLoaded = await page.locator("body").isVisible();
      expect(isPageLoaded).toBeTruthy();

      console.log(`Browser: ${browserName}`);
      await helpers.takeScreenshot(`browser-${browserName}-landing`);
    });

    test("should handle CSS Grid and Flexbox properly", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Check if CSS Grid/Flexbox layouts work
      const gridContainers = page.locator(
        '[style*="display: grid"], .grid, .gallery-grid',
      );
      const flexContainers = page.locator(
        '[style*="display: flex"], .flex, .flex-container',
      );

      const hasModernLayout =
        (await gridContainers.count()) > 0 ||
        (await flexContainers.count()) > 0;

      // Modern layouts should be present
      expect(hasModernLayout).toBeTruthy();
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test("should be responsive on different screen sizes", async ({ page }) => {
      const viewports = [
        { width: 320, height: 568, name: "small-mobile" },
        { width: 375, height: 667, name: "mobile" },
        { width: 768, height: 1024, name: "tablet" },
        { width: 1024, height: 768, name: "tablet-landscape" },
        { width: 1920, height: 1080, name: "desktop" },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/explore");
        await helpers.waitForNetworkIdle();

        // Check if content is not overflowing
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small margin

        await helpers.takeScreenshot(`responsive-${viewport.name}`);
      }
    });

    test("should handle touch interactions on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Test touch-friendly button sizes
      const buttons = page.locator("button, a");
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          // Touch targets should be at least 44px (iOS guidelines)
          expect(boundingBox.height).toBeGreaterThanOrEqual(32); // Slightly relaxed for web
          expect(boundingBox.width).toBeGreaterThanOrEqual(32);
        }
      }
    });
  });
});
