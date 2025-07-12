import { Page } from '@playwright/test';

// Constants
const DEFAULT_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000,
  requestTimeout: 10000,
  healthCheckTimeout: 5000,
} as const;

const ENV_MAPPINGS = {
  production: 'https://artsharebe.id.vn',
  preview: 'https://test.artsharebe.id.vn',
  local: 'http://localhost:3000',
} as const;

// Types
interface CleanupOptions {
  baseUrl?: string;
  authToken?: string;
  skipApiCleanup?: boolean;
  skipFileCleanup?: boolean;
  verbose?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  healthEndpoint?: string;
}

interface DeleteResult {
  success: boolean;
  id: string;
  error?: string;
}

type HttpMethod = 'GET' | 'POST' | 'DELETE';
type LogLevel = 'info' | 'verbose';

interface RequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

// Custom errors
class CleanupError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'CleanupError';
  }
}

/**
 *  Test data cleanup utility
 */
export class TestDataCleanup {
  private page: Page;
  private options: Required<CleanupOptions>;
  private authToken: string | null = null;

  constructor(page: Page, options: CleanupOptions = {}) {
    this.page = page;
    this.options = {
      authToken: '',
      skipApiCleanup: process.env.TEST_CLEANUP_ENABLED === 'false',
      skipFileCleanup: false,
      verbose: process.env.TEST_VERBOSE_LOGGING === 'true',
      retryAttempts: DEFAULT_CONFIG.retryAttempts,
      retryDelay: DEFAULT_CONFIG.retryDelay,
      healthEndpoint: '/health', // ✅ Default health endpoint
      ...options,
      baseUrl: options.baseUrl || this.getBackendUrl(),
    };
  }

  private getBackendUrl(): string {
    // Strategy 1: Use TEST_ENV set by cross-env (primary)
    const testEnv = process.env.TEST_ENV;
    if (testEnv && ENV_MAPPINGS[testEnv as keyof typeof ENV_MAPPINGS]) {
      const backend = ENV_MAPPINGS[testEnv as keyof typeof ENV_MAPPINGS];
      this.log(`🌍 Using backend for TEST_ENV ${testEnv}: ${backend}`);
      return backend;
    }

    // Strategy 2: Try global baseURL (fallback)
    try {
      const globalBaseURL = globalThis.__PLAYWRIGHT_BASE_URL__;
      if (globalBaseURL) {
        this.log(`🌐 Using backend from global baseURL: ${globalBaseURL}`);
        return globalBaseURL;
      }
    } catch {
      // Ignore errors
    }

    // Strategy 3: Final fallback to local
    this.log(`⚠️  No TEST_ENV detected, defaulting to local backend`);
    return ENV_MAPPINGS.local;
  }

  private async makeRequest<T = unknown>(
    url: string,
    options: RequestOptions,
    requireAuth = true,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth if required
    if (requireAuth) {
      const authToken = await this.getAuthToken();
      if (!authToken) {
        throw new CleanupError('No authentication token available');
      }
      headers.Authorization = `Bearer ${authToken}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeout || DEFAULT_CONFIG.requestTimeout,
    );

    try {
      this.log(`🌐 ${options.method} ${url}`, undefined, 'verbose');

      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new CleanupError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status,
        );
      }

      try {
        return await response.json();
      } catch {
        return null as T;
      }
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  //  Retry wrapper
  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    shouldRetry: (error: unknown) => boolean = () => true,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.log(
          `⚠️  Attempt ${attempt}/${this.options.retryAttempts} failed for ${context}:`,
          error,
          'verbose',
        );

        if (!shouldRetry(error) || attempt === this.options.retryAttempts) {
          break;
        }

        await this.sleep(this.options.retryDelay);
      }
    }

    throw lastError;
  }

  //  Bulk operation pattern
  private async performBulkOperation(
    items: string[],
    operation: (item: string) => Promise<void>,
    operationName: string,
    shouldSkip = false,
  ): Promise<DeleteResult[]> {
    if (shouldSkip || items.length === 0) {
      this.log(
        `ℹ️  Skipping ${operationName} (skip: ${shouldSkip}, items: ${items.length})`,
      );
      return [];
    }

    this.log(
      `🧹 Starting ${operationName} for ${items.length} items using backend: ${this.options.baseUrl}`,
    );

    const results = await Promise.allSettled(items.map(operation));

    return results.map((result, index) => ({
      success: result.status === 'fulfilled',
      id: items[index],
      error: result.status === 'rejected' ? String(result.reason) : undefined,
    }));
  }

  private createRetryStrategy(resourceType: string, id: string) {
    return (error: unknown): boolean => {
      if (error instanceof CleanupError) {
        if (error.status === 404) {
          this.log(`ℹ️  ${resourceType} ${id} already deleted or not found`);
          return false;
        }
        if (error.code === 'CONNECTION_FAILED') {
          return false;
        }
      }
      return true;
    };
  }

  //  Connection test with configurable endpoint
  async testConnection(): Promise<boolean> {
    this.log(`🔍 Testing connection to: ${this.options.baseUrl}`);

    try {
      await this.makeRequest(
        `${this.options.baseUrl}${this.options.healthEndpoint}`,
        { method: 'GET', timeout: DEFAULT_CONFIG.healthCheckTimeout },
        false,
      );

      this.log(`✅ Connection successful`);
      return true;
    } catch (error) {
      this.log(`⚠️  Cannot connect to backend: ${error}`);
      return false;
    }
  }

  //  Auth token retrieval
  private async getAuthToken(): Promise<string | null> {
    if (this.authToken) return this.authToken;

    // Check options first
    if (this.options.authToken) {
      this.authToken = this.options.authToken;
      return this.authToken;
    }

    // Try browser storage
    try {
      if (this.page && !this.page.isClosed()) {
        const token = await this.page.evaluate(() => {
          const keys = ['accessToken', 'token', 'authToken'];
          return (
            keys.map((key) => localStorage.getItem(key)).find(Boolean) || null
          );
        });

        if (token) {
          this.log('🔑 Using auth token from browser localStorage');
          this.authToken = token;
          return this.authToken;
        }
      }
    } catch (error) {
      this.log('Could not get auth token from browser:', error);
    }

    this.log('⚠️  No auth token found');
    return null;
  }

  // ✅ PUBLIC API METHODS
  async cleanupPosts(postIds: string[]): Promise<DeleteResult[]> {
    if (!(await this.testConnection())) {
      this.log(`⚠️  Cannot connect to backend. Skipping API cleanup.`);
      return postIds.map((id) => ({
        success: false,
        id,
        error: 'Connection failed',
      }));
    }

    return this.performBulkOperation(
      postIds,
      (postId) => this.deleteResource('post', postId),
      'post cleanup',
      this.options.skipApiCleanup,
    );
  }

  async cleanupFiles(fileUrls: string[]): Promise<DeleteResult[]> {
    return this.performBulkOperation(
      fileUrls,
      (fileUrl) => this.deleteFile(fileUrl),
      'file cleanup',
      this.options.skipFileCleanup,
    );
  }

  async cleanupUsers(userIds: string[]): Promise<DeleteResult[]> {
    return this.performBulkOperation(
      userIds,
      (userId) => this.deleteResource('user', userId),
      'user cleanup',
      this.options.skipApiCleanup,
    );
  }

  //  Resource deletion
  private async deleteResource(
    resourceType: 'post' | 'user',
    id: string,
  ): Promise<void> {
    await this.withRetry(
      () =>
        this.makeRequest(`${this.options.baseUrl}/${resourceType}s/${id}`, {
          method: 'DELETE',
        }),
      `${resourceType} ${id}`,
      this.createRetryStrategy(resourceType, id),
    );

    this.log(`✅ Successfully deleted ${resourceType}: ${id}`);
  }

  private async deleteFile(fileUrl: string): Promise<void> {
    await this.withRetry(
      () =>
        this.makeRequest(`${this.options.baseUrl}/upload/cleanup`, {
          method: 'POST',
          body: JSON.stringify({ fileUrl }),
        }),
      `file ${fileUrl}`,
      this.createRetryStrategy('file', fileUrl),
    );

    this.log(`✅ Successfully deleted file: ${fileUrl}`);
  }

  // Age-based cleanup
  async cleanupTestDataByAge(hours = 24): Promise<void> {
    if (this.options.skipApiCleanup) return;

    try {
      const result = await this.makeRequest<{
        posts_deleted: number;
        files_deleted: number;
      }>(`${this.options.baseUrl}/test/cleanup`, {
        method: 'POST',
        body: JSON.stringify({
          older_than_hours: hours,
          cleanup_posts: true,
          cleanup_files: true,
          cleanup_test_users: false,
        }),
      });

      this.log(
        `✅ Cleaned up ${result.posts_deleted} posts and ${result.files_deleted} files`,
      );
    } catch (error) {
      this.log('⚠️  Age-based cleanup error:', error);
    }
  }

  async verifyCleanup(
    postIds: string[],
    fileUrls: string[],
  ): Promise<{ posts: string[]; files: string[] }> {
    const authToken = await this.getAuthToken();
    if (!authToken) {
      return { posts: postIds, files: fileUrls };
    }

    const [postResults, fileResults] = await Promise.allSettled([
      this.verifyResourcesDeletion(postIds, 'posts'),
      this.verifyFilesDeletion(fileUrls),
    ]);

    return {
      posts: postResults.status === 'fulfilled' ? postResults.value : postIds,
      files: fileResults.status === 'fulfilled' ? fileResults.value : fileUrls,
    };
  }

  private async verifyResourcesDeletion(
    resourceIds: string[],
    resourceType: string,
  ): Promise<string[]> {
    const failed: string[] = [];

    await Promise.allSettled(
      resourceIds.map(async (resourceId) => {
        try {
          await this.makeRequest(
            `${this.options.baseUrl}/${resourceType}/${resourceId}`,
            { method: 'GET' },
          );
          failed.push(resourceId); // Still exists
        } catch (error) {
          if (!(error instanceof CleanupError && error.status === 404)) {
            failed.push(resourceId); // Assume still exists on non-404 errors
          }
        }
      }),
    );

    return failed;
  }

  private async verifyFilesDeletion(fileUrls: string[]): Promise<string[]> {
    const failed: string[] = [];

    await Promise.allSettled(
      fileUrls.map(async (fileUrl) => {
        try {
          const response = await fetch(fileUrl, { method: 'HEAD' });
          if (response.ok) {
            failed.push(fileUrl);
          }
        } catch {
          failed.push(fileUrl); // Assume still exists on error
        }
      }),
    );

    return failed;
  }

  //  Utility methods
  private log(message: string, data?: unknown, level: LogLevel = 'info'): void {
    if (level === 'verbose' && !this.options.verbose) return;
    data ? console.log(message, data) : console.log(message);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

//  Factory function for common use cases
export function createTestCleanup(
  page: Page,
  environment?: 'production' | 'preview' | 'local',
) {
  const options: CleanupOptions = {
    verbose: process.env.TEST_VERBOSE_LOGGING === 'true',
  };

  if (environment) {
    options.baseUrl = ENV_MAPPINGS[environment];
  }

  return new TestDataCleanup(page, options);
}

//  Simplified cleanup helper
export async function quickCleanup(
  page: Page,
  postIds: string[] = [],
  fileUrls: string[] = [],
  userIds: string[] = [],
) {
  const cleanup = new TestDataCleanup(page, { verbose: true });

  const [postResults, fileResults, userResults] = await Promise.allSettled([
    cleanup.cleanupPosts(postIds),
    cleanup.cleanupFiles(fileUrls),
    cleanup.cleanupUsers(userIds),
  ]);

  return {
    posts: postResults.status === 'fulfilled' ? postResults.value : [],
    files: fileResults.status === 'fulfilled' ? fileResults.value : [],
    users: userResults.status === 'fulfilled' ? userResults.value : [],
  };
}

// Global variable declaration
declare global {
  // eslint-disable-next-line no-var
  var __PLAYWRIGHT_BASE_URL__: string | undefined;
}
