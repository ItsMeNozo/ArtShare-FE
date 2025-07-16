import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// Environment-specific configurations
const environments = {
  local: {
    baseURL: 'http://localhost:5173',
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  },
  production: {
    baseURL: 'https://artsharezone-black.vercel.app',
    webServer: undefined,
  },
  preview: {
    baseURL: 'https://preview.artsharebe.id.vn',
    webServer: undefined,
  },
};

const env = process.env.TEST_ENV || 'local';
const config =
  environments[env as keyof typeof environments] || environments.local;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: config.baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Increase timeouts for better reliability */
    actionTimeout: 60000,
    navigationTimeout: 120000,
  },

  /* Configure projects for major browsers */
  projects: [
    // E2E Tests (All tests for local development)
    {
      name: 'e2e-chrome',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use actual Chrome instead of Chromium
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Production-Safe Tests (Merged: Smoke + Safe - Read-only tests)
    {
      name: 'production-safe',
      testDir: './tests/e2e',
      grep: /@safe|@smoke/, // Combined grep pattern
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: environments.production.baseURL,
        trace: 'on-first-retry',
      },
    },

    // Unsafe Tests (Data Modifying - Preview environment only)
    {
      name: 'unsafe',
      testDir: './tests/e2e',
      grep: /@unsafe/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: environments.preview.baseURL,
        trace: 'on-first-retry',
      },
    },

    // AI Tests (Manual only - Production, but with cost awareness)
    {
      name: 'ai',
      testDir: './tests/e2e',
      grep: /@ai/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: environments.production.baseURL,
        trace: 'on', // Always trace AI tests since they cost money
      },
    },

    // Cleanup Tests (Preview Environment)
    {
      name: 'cleanup',
      testDir: './tests/e2e',
      grep: /@cleanup/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: environments.preview.baseURL,
        trace: 'on-first-retry',
      },
    },

    // Speed Insights (Production Only)
    {
      name: 'speed-insights',
      testDir: './tests/e2e',
      testMatch: /speed-insights\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: environments.production.baseURL,
        trace: 'off',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: config.webServer,

  /* Global setup and teardown */
  globalSetup: './tests/utils/global-setup',
  globalTeardown: './tests/utils/global-teardown',
});
