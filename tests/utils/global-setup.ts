import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  // Setup test environment
  process.env.NODE_ENV = 'test';

  // Verify required environment variables
  const requiredEnvVars = ['TEST_USER_EMAIL', 'TEST_USER_PASSWORD'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(', ')}`,
    );
    console.warn('Tests will use fallback values');
  }

  // Log test configuration
  console.log(
    `📊 Running tests with baseURL: ${config.projects[0]?.use?.baseURL || 'default'}`,
  );
  console.log(
    `👤 Test user email: ${process.env.TEST_USER_EMAIL || 'fallback'}`,
  );

  try {
    // Add any setup logic here if needed
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
