import { Page, Locator } from "@playwright/test";

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for network requests to settle
   */
  async waitForNetworkIdle(timeout = 5000) {
    await this.page.waitForLoadState("networkidle", { timeout });
  }
  /**
   * Fill form field and wait for validation
   */
  async fillField(selector: string | Locator, value: string) {
    if (typeof selector === "string") {
      await this.page.fill(selector, value);
    } else {
      await selector.fill(value);
    }
    await this.page.waitForTimeout(500); // Allow for debounced validation
  }
  /**
   * Click button and wait for navigation or network response
   */
  async clickAndWait(
    selector: string | Locator,
    options?: { waitForNavigation?: boolean; waitForResponse?: string },
  ) {
    const { waitForNavigation = false, waitForResponse } = options || {};

    if (waitForNavigation) {
      await Promise.all([
        this.page.waitForNavigation(),
        typeof selector === "string"
          ? this.page.click(selector)
          : selector.click(),
      ]);
    } else if (waitForResponse) {
      await Promise.all([
        this.page.waitForResponse((resp) =>
          resp.url().includes(waitForResponse),
        ),
        typeof selector === "string"
          ? this.page.click(selector)
          : selector.click(),
      ]);
    } else {
      if (typeof selector === "string") {
        await this.page.click(selector);
      } else {
        await selector.click();
      }
    }
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: "visible", timeout });
    await this.page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel);
        return element && element.getBoundingClientRect().height > 0;
      },
      selector,
      { timeout: 5000 },
    );
  }

  /**
   * Check if user is authenticated by looking for user-specific elements
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Look for elements that only appear when logged in
      await this.page.waitForSelector(
        '[data-testid="user-menu"], .user-avatar, [href="/profile"]',
        {
          timeout: 3000,
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string) {
    await this.page.goto("/login");
    await this.fillField('input[type="email"]', email);
    await this.fillField('input[type="password"]', password);
    await this.clickAndWait('button[type="submit"]', {
      waitForNavigation: true,
    });
  }

  /**
   * Logout user
   */
  async logout() {
    // Try different possible logout selectors
    const logoutSelectors = [
      '[data-testid="logout-button"]',
      'button:has-text("Logout")',
      'a:has-text("Logout")',
      ".logout",
      '[href="/logout"]',
    ];

    for (const selector of logoutSelectors) {
      try {
        await this.page.click(selector, { timeout: 2000 });
        await this.page.waitForNavigation({ timeout: 5000 });
        return;
      } catch {
        continue;
      }
    }

    // If no logout button found, clear storage and reload
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
  } /**
   * Mock API responses for testing
   */
  async mockApiResponse(
    url: string,
    response: Record<string, unknown>,
    status = 200,
    method?: string,
  ) {
    await this.page.route(`**/*${url}*`, (route) => {
      if (method && route.request().method() !== method) {
        route.continue();
        return;
      }
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      route.continue();
    });
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = [];

    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Test responsive behavior
   */
  async testResponsive(callback: () => Promise<void>) {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await callback();
    }
  }
}

export const testData = {
  validUser: {
    email: "test@artshare.com",
    password: "TestPassword123!",
    username: "testuser",
    fullName: "Test User",
    bio: "This is a test user bio for automation testing.",
    birthday: "1990-01-01",
  },
  invalidUser: {
    email: "invalid-email",
    password: "123",
    username: "",
    fullName: "",
  },
  testPost: {
    title: "Test Art Post",
    description: "This is a test post created by automation",
    tags: ["test", "automation", "art"],
  },
};
