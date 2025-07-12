import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');

  try {
    // Cleanup logic for test environment
    console.log('🗑️  Cleaning up test environment...');

    // Clean up any global test data if needed
    // Note: Since we're using mocked data, most cleanup is handled per-test

    // Log test completion stats
    console.log(
      `📊 Test run completed for ${config.projects.length} project(s)`,
    );

    // Reset environment
    delete process.env.NODE_ENV;

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
}

export default globalTeardown;
