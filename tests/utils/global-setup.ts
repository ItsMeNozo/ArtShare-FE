import { FullConfig } from '@playwright/test';

const ENV_PROJECT_MAPPING = {
  production: ['production-safe', 'ai'],
  preview: ['unsafe', 'cleanup'],
  local: ['e2e-chrome'],
} as const;

declare global {
  // eslint-disable-next-line no-var
  var __PLAYWRIGHT_BASE_URL__: string | undefined;
  // eslint-disable-next-line no-var
  var __TEST_ENVIRONMENT__: string | undefined;
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  process.env.NODE_ENV = 'test';

  const testEnv = getEnvironment();
  const activeProject = findActiveProject(config, testEnv);
  const baseURL = activeProject?.use?.baseURL;

  globalThis.__PLAYWRIGHT_BASE_URL__ = baseURL;
  globalThis.__TEST_ENVIRONMENT__ = testEnv;

  validateEnvironmentVariables();
  logSetupResults(testEnv, activeProject?.name, baseURL);

  console.log('✅ Global setup completed successfully');
}

function getEnvironment(): string {
  const testEnv = process.env.TEST_ENV;
  if (testEnv && isValidEnvironment(testEnv)) {
    console.log(`🌍 Environment from TEST_ENV: ${testEnv}`);
    return testEnv;
  }

  const envFromArgs = parseEnvironmentFromArgs();
  if (envFromArgs) {
    console.log(`🔍 Environment from command args: ${envFromArgs}`);
    return envFromArgs;
  }

  console.log('⚠️  No environment detected, defaulting to local');
  return 'local';
}

function isValidEnvironment(env: string): boolean {
  return ['production', 'preview', 'local'].includes(env);
}

function parseEnvironmentFromArgs(): string | null {
  const args = process.argv.join(' ');

  if (
    args.includes('--project=production-safe') ||
    args.includes('test:production')
  ) {
    return 'production';
  }
  if (args.includes('--project=unsafe') || args.includes('test:preview')) {
    return 'preview';
  }
  if (args.includes('--project=e2e-chrome') || args.includes('test:local')) {
    return 'local';
  }

  return null;
}

function findActiveProject(config: FullConfig, testEnv: string) {
  const projectNames =
    ENV_PROJECT_MAPPING[testEnv as keyof typeof ENV_PROJECT_MAPPING] || [];

  console.log(`🔍 Looking for projects: ${projectNames.join(', ')}`);

  const project = config.projects.find((project) => {
    const name = project.name?.toLowerCase() || '';
    return projectNames.some(
      (projectName) => name === projectName || name.includes(projectName),
    );
  });

  const selectedProject = project || config.projects[0];
  console.log(`✅ Selected project: ${selectedProject?.name || 'default'}`);

  return selectedProject;
}

function validateEnvironmentVariables(): void {
  const requiredVars = ['TEST_USER_EMAIL', 'TEST_USER_PASSWORD'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(', ')}`,
    );
    console.warn('Tests will use fallback values');
  }
}

function logSetupResults(
  testEnv: string,
  projectName?: string,
  baseURL?: string,
): void {
  console.log(`📊 Running tests with baseURL: ${baseURL || 'default'}`);
  console.log(`🎯 Active project: ${projectName || 'default'}`);
  console.log(`🌍 Test environment: ${testEnv}`);
  console.log(
    `👤 Test user email: ${process.env.TEST_USER_EMAIL || 'fallback'}`,
  );
}

export default globalSetup;
