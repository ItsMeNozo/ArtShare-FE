import { PlaywrightTestConfig, devices } from "@playwright/test";
import { resolve } from "path";

// Environment-specific configurations
const environments = {
  local: {
    baseURL: "http://localhost:5173",
    webServer: {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  },
  staging: {
    baseURL: "https://staging.artshare.com",
    webServer: undefined,
  },
  production: {
    baseURL: "https://artshare.com",
    webServer: undefined,
  },
};

const env = process.env.TEST_ENV || "local";
const config =
  environments[env as keyof typeof environments] || environments.local;

export const testConfig: PlaywrightTestConfig = {
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: config.baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad Pro"] },
    },
  ],
  webServer: config.webServer,
  // Global setup and teardown
  globalSetup: resolve("./tests/utils/global-setup.ts"),
  globalTeardown: resolve("./tests/utils/global-teardown.ts"),
};

export default testConfig;
