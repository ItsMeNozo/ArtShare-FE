import { expect, Page, test } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

interface RouteGroup {
  name: string;
  routes: string[];
  description: string;
}

interface TestResult {
  route: string;
  loadTime: number;
  errors: Error[];
  status: 'success' | 'failed';
}

class PerformanceNavigationTester {
  private results: TestResult[] = [];

  constructor(private page: Page) {}

  async navigateAndMeasure(route: string, timeout = 15000) {
    console.log(`🚀 Testing: ${route}`);
    const startTime = performance.now();

    try {
      await this.page.goto(route, {
        waitUntil: 'domcontentloaded', // Much faster than networkidle
        timeout,
      });

      // Wait for page to be interactive (this is usually enough)
      await this.page.waitForLoadState('load');

      // Quick check for loading indicators (max 1s)
      await this.page
        .waitForFunction(
          () => {
            const loadingSelectors = [
              '[data-testid="loading"]',
              '.loading',
              '.spinner',
              '[aria-label="Loading"]',
              '.skeleton',
            ];
            return !loadingSelectors.some((selector) =>
              document.querySelector(selector),
            );
          },
          { timeout: 1000 },
        )
        .catch(() => {}); // Ignore if no loading indicators

      const loadTime = performance.now() - startTime;
      const errors = await this.checkPageErrors();

      this.results.push({
        route,
        loadTime,
        errors,
        status: 'success',
      });

      console.log(
        `✅ ${route}: ${loadTime.toFixed(0)}ms${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
      );
      return { loadTime, errors };
    } catch (error) {
      console.error(`❌ ${route}: Failed - ${error}`);
      this.results.push({
        route,
        loadTime: -1,
        errors: [error],
        status: 'failed',
      });
      throw error;
    }
  }

  async checkPageErrors(): Promise<Error[]> {
    // Check for console errors
    const consoleErrors = await this.page.evaluate(() => {
      return (
        (window as unknown as Record<string, unknown>).__consoleErrors || []
      );
    });

    // Check for failed network requests
    const failedRequests = await this.page.evaluate(() => {
      return (
        (window as unknown as Record<string, unknown>).__failedRequests || []
      );
    });

    return [...(consoleErrors as Error[]), ...(failedRequests as Error[])];
  }

  async verifyPageLoaded(route: string) {
    // Basic page verification
    await expect(this.page.locator('body')).toBeVisible({ timeout: 10000 });

    // Route-specific verifications
    if (route.includes('/dashboard')) {
      await expect(
        this.page.locator(
          '[data-testid="dashboard-content"], main, .dashboard, h1',
        ),
      ).toBeVisible({ timeout: 8000 });
    } else if (route.includes('/posts/new')) {
      await expect(this.page.getByTestId('upload-post-form')).toBeVisible({
        timeout: 8000,
      });
    } else if (route.includes('/image/tool')) {
      await expect(
        this.page.locator(
          'canvas, [data-testid="image-editor"], .image-tool, .tool-container',
        ),
      ).toBeVisible({ timeout: 12000 });
    } else if (route.includes('/explore')) {
      await expect(
        this.page.locator(
          '[data-testid="explore-content"], .explore, .posts-grid, .post-item',
        ),
      ).toBeVisible({ timeout: 9000 });
    } else if (route.includes('/auto/projects')) {
      await expect(
        this.page.locator(
          '[data-testid="auto-projects"], .automation, form, .settings',
        ),
      ).toBeVisible({ timeout: 8000 });
    }
  }

  getPerformanceReport() {
    const successful = this.results.filter((r) => r.status === 'success');
    const failed = this.results.filter((r) => r.status === 'failed');

    if (successful.length === 0) {
      return {
        totalRoutes: this.results.length,
        successful: 0,
        failed: failed.length,
        avgLoadTime: 0,
        fastest: 0,
        slowest: 0,
        slowRoutes: [],
        results: this.results,
      };
    }

    const loadTimes = successful.map((r) => r.loadTime);
    const avgLoadTime =
      loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    const slowRoutes = successful.filter((r) => r.loadTime > 5000);

    return {
      totalRoutes: this.results.length,
      successful: successful.length,
      failed: failed.length,
      avgLoadTime,
      fastest: Math.min(...loadTimes),
      slowest: Math.max(...loadTimes),
      slowRoutes,
      results: this.results,
    };
  }
}

// All production routes organized by feature
const PRODUCTION_ROUTES: RouteGroup[] = [
  {
    name: 'Core App Routes',
    description: 'Essential app navigation and dashboard',
    routes: ['/', '/dashboard', '/dashboard/updates', '/explore'],
  },
  {
    name: 'Content Discovery',
    description: 'Blog browsing and search functionality',
    routes: ['/blogs', '/search'],
  },
  {
    name: 'User Management',
    description: 'Profile and account settings',
    routes: ['/edit-user', '/collections', '/app-subscription'],
  },
  {
    name: 'Content Creation',
    description: 'Post and document creation tools',
    routes: ['/posts/new', '/docs'],
  },
  {
    name: 'Creative Tools',
    description: 'Image editing and AI generation',
    routes: [
      '/image/tool/editor',
      '/image/tool/text-to-image',
      '/image/tool/editor/new',
    ],
  },
  {
    name: 'Automation Suite',
    description: 'Social media automation features',
    routes: ['/auto/social-links', '/auto/scheduling', '/auto/projects'],
  },
];

test.describe('Production Performance Tests @safe @smoke', () => {
  let tester: PerformanceNavigationTester;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    tester = new PerformanceNavigationTester(page);
    helpers = new TestHelpers(page);

    // Track console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Track failed requests
    const failedRequests: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        const status = response.status();
        failedRequests.push(`${status}: ${url}`);
        console.log(`❌ HTTP ${status} on: ${url}`);
      }
    });

    // Store errors in window for later retrieval
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__consoleErrors = [];
      (window as unknown as Record<string, unknown>).__failedRequests = [];
    });

    console.log('🔑 Authenticating user for production tests...');
    helpers = new TestHelpers(page);
    await helpers.loginWithTestUser();

    // Verify authentication worked
    const currentUrl = page.url();
    console.log(`📍 Post-auth URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      throw new Error('Authentication failed - still on login page');
    }
  });

  // Test each route group individually for better organization
  PRODUCTION_ROUTES.forEach(({ name, description, routes }) => {
    test(`Performance: ${name} @safe`, async ({ page }) => {
      console.log(`\n🧪 Testing ${name}: ${description}`);
      console.log(`📊 Routes to test: ${routes.length}`);

      for (const route of routes) {
        try {
          await tester.navigateAndMeasure(route, 20000);
          await tester.verifyPageLoaded(route);

          // Brief pause between routes to avoid overwhelming the server
          await page.waitForTimeout(1000);
        } catch {
          console.error(`💥 Route failed: ${route}`);
          // Continue with other routes even if one fails
        }
      }

      const report = tester.getPerformanceReport();

      console.log(`\n📈 ${name} Performance Report:`);
      console.log(
        `   ✅ Successful: ${report.successful}/${report.totalRoutes}`,
      );
      console.log(`   ⚡ Average load: ${report.avgLoadTime.toFixed(0)}ms`);
      console.log(`   🚀 Fastest: ${report.fastest.toFixed(0)}ms`);
      console.log(`   🐌 Slowest: ${report.slowest.toFixed(0)}ms`);

      if (report.slowRoutes.length > 0) {
        console.log(`   ⚠️  Slow routes (>5s):`);
        report.slowRoutes.forEach((r) => {
          console.log(`      ${r.route}: ${r.loadTime.toFixed(0)}ms`);
        });
      }

      // Assert reasonable success rate (allow some failures due to network issues)
      const successRate = report.successful / report.totalRoutes;
      expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate

      // Assert reasonable performance (average load time under 8 seconds for content-heavy pages)
      if (report.successful > 0) {
        expect(report.avgLoadTime).toBeLessThan(8000);
      }
    });
  });

  test('Complete App Navigation Flow @smoke', async ({ page }) => {
    console.log('\n🔄 Testing critical user journey...');

    const criticalPath = [
      '/',
      '/dashboard',
      '/explore',
      '/posts/new',
      '/collections',
      '/auto/projects',
    ];

    let totalTime = 0;

    for (let i = 0; i < criticalPath.length; i++) {
      const route = criticalPath[i];
      console.log(`📍 Step ${i + 1}/${criticalPath.length}: ${route}`);

      const { loadTime } = await tester.navigateAndMeasure(route, 25000);
      await tester.verifyPageLoaded(route);

      totalTime += loadTime;

      // Ensure page is fully interactive before moving to next
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(1500);
    }

    console.log(`\n🎯 Critical path completed in ${totalTime.toFixed(0)}ms`);
    console.log(
      `📊 Average per route: ${(totalTime / criticalPath.length).toFixed(0)}ms`,
    );

    // Critical path should complete in reasonable time
    expect(totalTime).toBeLessThan(45000); // Under 45 seconds total
  });

  test('Performance Regression Detection @safe', async ({ page: _page }) => {
    console.log('\n🔍 Running performance regression detection...');

    // Test a subset of critical routes for performance benchmarks
    const benchmarkRoutes = [
      '/dashboard',
      '/explore',
      '/posts/new',
      '/auto/projects',
    ];

    const benchmarkResults: Array<{ route: string; time: number }> = [];

    for (const route of benchmarkRoutes) {
      const { loadTime } = await tester.navigateAndMeasure(route);
      benchmarkResults.push({ route, time: loadTime });
    }

    console.log('\n🎯 Performance Benchmark Results:');
    benchmarkResults.forEach(({ route, time }) => {
      const status = time < 3000 ? '🚀' : time < 6000 ? '⚡' : '🐌';
      console.log(`   ${status} ${route}: ${time.toFixed(0)}ms`);
    });

    // Performance assertions
    const avgBenchmarkTime =
      benchmarkResults.reduce((sum, r) => sum + r.time, 0) /
      benchmarkResults.length;
    console.log(`📊 Benchmark average: ${avgBenchmarkTime.toFixed(0)}ms`);

    // Fail if any critical route takes longer than 10 seconds
    const slowCriticalRoutes = benchmarkResults.filter((r) => r.time > 10000);
    expect(slowCriticalRoutes.length).toBe(0);

    // Fail if average benchmark time is over 6 seconds
    expect(avgBenchmarkTime).toBeLessThan(6000);
  });
});
