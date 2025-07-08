import { Locator, Page } from '@playwright/test';
import { TestDataCleanup } from './test-data-cleanup';

export class TestHelpers {
  private createdTestData: {
    posts: string[];
    users: string[];
    uploads: string[];
  } = {
    posts: [],
    users: [],
    uploads: [],
  };

  private cleanupUtility: TestDataCleanup;

  constructor(private page: Page) {
    this.cleanupUtility = new TestDataCleanup(page);
  }

  /**
   * Wait for network requests to settle
   */
  async waitForNetworkIdle(timeout = 5000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }
  /**
   * Fill form field and wait for validation
   */
  async fillField(selector: string | Locator, value: string) {
    if (typeof selector === 'string') {
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
        typeof selector === 'string'
          ? this.page.click(selector)
          : selector.click(),
      ]);
    } else if (waitForResponse) {
      await Promise.all([
        this.page.waitForResponse((resp) =>
          resp.url().includes(waitForResponse),
        ),
        typeof selector === 'string'
          ? this.page.click(selector)
          : selector.click(),
      ]);
    } else {
      if (typeof selector === 'string') {
        await this.page.click(selector);
      } else {
        await selector.click();
      }
    }
  }

  /**
   * Attach a file to a file input
   */
  async attachFile(selector: string, filePath: string) {
    await this.page.locator(selector).setInputFiles(filePath);
  }

  /**
   * Login with test user credentials
   */
  async loginWithTestUser() {
    const email = testData.validUser.email;
    const password = testData.validUser.password;

    if (!email || !password) {
      throw new Error(
        'Test credentials not configured. Please set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.',
      );
    }

    await this.loginWithEmail(email, password);
  }

  /**
   * Cleanup test data and clear mocks
   */
  async cleanup() {
    // Clean up real test data first using the advanced cleanup utility
    await this.cleanupTestDataAdvanced();

    // Then clean up browser state
    // Clear any route mocks
    await this.page.unrouteAll();

    // Clear browser storage - handle SecurityError gracefully
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
          // Clear any indexed DB if used
          if (window.indexedDB) {
            indexedDB.databases().then((databases) => {
              databases.forEach((db) => {
                if (db.name) {
                  indexedDB.deleteDatabase(db.name);
                }
              });
            });
          }
        } catch (error) {
          console.warn('Could not clear storage:', error.message);
        }
      });
    } catch (error) {
      console.warn('Could not access page storage:', error.message);
    }

    // Clear cookies
    await this.page.context().clearCookies();
  }

  /**
   * Advanced cleanup using the TestDataCleanup utility
   */
  async cleanupTestDataAdvanced() {
    console.log('🧹 Starting advanced test data cleanup...');

    // Skip cleanup if no data was created
    if (
      this.createdTestData.posts.length === 0 &&
      this.createdTestData.users.length === 0 &&
      this.createdTestData.uploads.length === 0
    ) {
      console.log('ℹ️  No test data to cleanup');
      return;
    }

    try {
      // Use the advanced cleanup utility
      await this.cleanupUtility.cleanupPosts(this.createdTestData.posts);
      await this.cleanupUtility.cleanupFiles(this.createdTestData.uploads);
      await this.cleanupUtility.cleanupUsers(this.createdTestData.users);

      // Verify cleanup was successful
      const failed = await this.cleanupUtility.verifyCleanup(
        this.createdTestData.posts,
        this.createdTestData.uploads,
      );

      if (failed.posts.length > 0) {
        console.warn(
          `⚠️  Failed to clean up ${failed.posts.length} posts:`,
          failed.posts,
        );
      }
      if (failed.files.length > 0) {
        console.warn(
          `⚠️  Failed to clean up ${failed.files.length} files:`,
          failed.files,
        );
      }

      // Reset tracking arrays
      this.createdTestData = {
        posts: [],
        users: [],
        uploads: [],
      };

      console.log('✅ Advanced test data cleanup completed');
    } catch (error) {
      console.error('❌ Advanced test data cleanup failed:', error);
      // Fallback to basic cleanup
      await this.cleanupTestData();
    }
  }

  /**
   * Reset page state for next test
   */
  async resetPageState() {
    await this.cleanup();
    // Navigate to a clean state
    await this.page.goto('/');
  }

  /**
   * Track a created post for cleanup
   */
  trackCreatedPost(postId: string) {
    if (postId) {
      this.createdTestData.posts.push(postId);
      console.log(`📝 Tracking created post: ${postId}`);
    }
  }

  /**
   * Track a created user for cleanup
   */
  trackCreatedUser(userId: string) {
    if (userId) {
      this.createdTestData.users.push(userId);
      console.log(`👤 Tracking created user: ${userId}`);
    }
  }

  /**
   * Track an uploaded file for cleanup
   */
  trackUploadedFile(fileUrl: string) {
    if (fileUrl) {
      this.createdTestData.uploads.push(fileUrl);
      console.log(`📎 Tracking uploaded file: ${fileUrl}`);
    }
  }

  /**
   * Cleanup all created test data
   */
  async cleanupTestData() {
    console.log('🧹 Cleaning up test data...');

    // Skip cleanup if no data was created
    if (
      this.createdTestData.posts.length === 0 &&
      this.createdTestData.users.length === 0 &&
      this.createdTestData.uploads.length === 0
    ) {
      console.log('ℹ️  No test data to cleanup');
      return;
    }

    try {
      // Get auth token for API calls
      const authToken = await this.page.evaluate(() => {
        try {
          return (
            localStorage.getItem('authToken') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('authToken') ||
            sessionStorage.getItem('access_token')
          );
        } catch (error) {
          console.warn(
            'Could not access storage for auth token:',
            error.message,
          );
          return null;
        }
      });

      if (!authToken) {
        console.warn('⚠️  No auth token found, skipping API cleanup');
        return;
      }

      const headers = {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      };

      const baseUrl = process.env.VITE_BE_URL || 'http://localhost:3000';

      // Cleanup posts
      for (const postId of this.createdTestData.posts) {
        try {
          const response = await fetch(`${baseUrl}/posts/${postId}`, {
            method: 'DELETE',
            headers,
          });
          if (response.ok) {
            console.log(`✅ Deleted post: ${postId}`);
          } else {
            console.warn(
              `⚠️  Failed to delete post ${postId}: ${response.status} ${response.statusText}`,
            );
          }
        } catch (error) {
          console.warn(`⚠️  Error deleting post ${postId}:`, error);
        }
      }

      // Cleanup uploaded files
      for (const fileUrl of this.createdTestData.uploads) {
        try {
          const response = await fetch(`${baseUrl}/upload/cleanup`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ fileUrl }),
          });
          if (response.ok) {
            console.log(`✅ Deleted file: ${fileUrl}`);
          } else {
            console.warn(
              `⚠️  Failed to delete file ${fileUrl}: ${response.status} ${response.statusText}`,
            );
          }
        } catch (error) {
          console.warn(`⚠️  Error deleting file ${fileUrl}:`, error);
        }
      }

      // Cleanup test users (be careful with this - usually not needed for E2E tests)
      for (const userId of this.createdTestData.users) {
        try {
          const response = await fetch(`${baseUrl}/users/${userId}`, {
            method: 'DELETE',
            headers,
          });
          if (response.ok) {
            console.log(`✅ Deleted user: ${userId}`);
          } else {
            console.warn(
              `⚠️  Failed to delete user ${userId}: ${response.status} ${response.statusText}`,
            );
          }
        } catch (error) {
          console.warn(`⚠️  Error deleting user ${userId}:`, error);
        }
      }

      // Reset tracking arrays
      this.createdTestData = {
        posts: [],
        users: [],
        uploads: [],
      };

      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.error('❌ Test data cleanup failed:', error);
    }
  }

  /**
   * Extract post ID from response or URL
   */
  async extractPostIdFromResponse(): Promise<string | null> {
    try {
      // Wait for navigation after post creation
      await this.page.waitForURL(/.*\/post\/.*/, { timeout: 10000 });

      // Extract post ID from URL
      const url = this.page.url();
      const match = url.match(/\/post\/(\w+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.warn('Could not extract post ID from URL:', error);
      return null;
    }
  }

  /**
   * Extract post ID from API response
   */
  async extractPostIdFromApiResponse(): Promise<string | null> {
    return new Promise((resolve) => {
      this.page.on('response', async (response) => {
        if (
          response.url().includes('/posts') &&
          response.request().method() === 'POST'
        ) {
          try {
            const responseData = await response.json();
            if (responseData.id) {
              resolve(responseData.id.toString());
            }
          } catch (error) {
            console.warn('Could not extract post ID from API response:', error);
          }
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => resolve(null), 10000);
    });
  }

  /**
   * Wait for and track post creation
   */
  async waitForPostCreation(): Promise<string | null> {
    try {
      // Try to get post ID from API response first
      const postIdFromApi = await this.extractPostIdFromApiResponse();
      if (postIdFromApi) {
        this.trackCreatedPost(postIdFromApi);
        return postIdFromApi;
      }

      // Fallback to URL extraction
      const postIdFromUrl = await this.extractPostIdFromResponse();
      if (postIdFromUrl) {
        this.trackCreatedPost(postIdFromUrl);
        return postIdFromUrl;
      }

      return null;
    } catch (error) {
      console.warn('Could not track post creation:', error);
      return null;
    }
  }

  /**
   * Submit a post form and track creation if real
   */
  async submitPostAndTrack(
    submitButtonSelector: string = 'button[type="submit"]',
  ): Promise<string | null> {
    try {
      const submitButton = this.page.locator(submitButtonSelector);

      // Set up response listener before clicking submit
      let postId: string | null = null;

      // Listen for real API responses
      this.page.on('response', async (response) => {
        if (
          response.url().includes('/posts') &&
          response.request().method() === 'POST'
        ) {
          try {
            const responseData = await response.json();
            if (responseData.id) {
              postId = responseData.id.toString();
              if (postId) {
                this.trackCreatedPost(postId);
              }
            }
          } catch (error) {
            console.warn('Could not extract post ID from API response:', error);
          }
        }
      });

      // Click submit button
      await submitButton.click();

      // Wait for success message
      await this.page.waitForSelector(
        ':text("Post successfully created!"), .success-message',
        { timeout: 10000 },
      );

      // If we didn't get post ID from API response, try to get it from URL
      if (!postId) {
        postId = await this.extractPostIdFromResponse();
        if (postId) {
          this.trackCreatedPost(postId);
        }
      }

      return postId;
    } catch (error) {
      console.warn('Could not submit post and track:', error);
      return null;
    }
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
    await this.page.goto('/login');
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
      '.logout',
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
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          console.warn('Could not clear storage during logout:', error.message);
        }
      });
    } catch (error) {
      console.warn(
        'Could not access page storage during logout:',
        error.message,
      );
    }
    await this.page.reload();
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
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
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
    username: 'testuser',
    fullName: 'Test User',
    bio: 'This is a test user bio for automation testing.',
    birthday: '1990-01-01',
  },
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    username: '',
    fullName: '',
  },
  testPost: {
    title: 'Test Art Post',
    description: 'This is a test post created by automation',
    tags: ['test', 'automation', 'art'],
  },
  mockResponses: {
    loginSuccess: {
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: process.env.TEST_USER_EMAIL,
        is_onboard: true,
      },
      message: 'Login successful',
    },
    postCreationSuccess: {
      id: 123,
      title: 'My Artwork Test',
      description: 'This is a test artwork description',
      media: [{ url: 'https://example.com/image1.jpg', type: 'image' }],
      created_at: new Date().toISOString(),
      message: 'Post successfully created!',
    },
    aiContentGeneration: {
      title: 'Beautiful Sunset Landscape',
      description:
        'A stunning sunset landscape with vibrant colors and peaceful atmosphere',
      categories: ['landscape', 'nature', 'sunset'],
      credits_used: 1,
    },
    videoValidationError: {
      valid: false,
      error: 'Video duration exceeds 60 seconds limit',
    },
    videoValidationSuccess: {
      valid: true,
      duration: 45,
      thumbnail: 'https://example.com/video-thumb.jpg',
    },
  },
};
