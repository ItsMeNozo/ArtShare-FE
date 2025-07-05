import { Page } from '@playwright/test';

interface CleanupOptions {
  baseUrl?: string;
  authToken?: string;
  skipApiCleanup?: boolean;
  skipFileCleanup?: boolean;
  verbose?: boolean;
}

/**
 * Advanced test data cleanup utility
 */
export class TestDataCleanup {
  private page: Page;
  private options: CleanupOptions;

  constructor(page: Page, options: CleanupOptions = {}) {
    this.page = page;
    this.options = {
      baseUrl:
        process.env.TEST_BE_URL ||
        process.env.VITE_BE_URL ||
        'http://localhost:3000',
      verbose: process.env.TEST_VERBOSE_LOGGING === 'true',
      skipApiCleanup: process.env.TEST_CLEANUP_ENABLED === 'false',
      skipFileCleanup: false,
      ...options,
    };
  }

  /**
   * Clean up posts by IDs
   */
  async cleanupPosts(postIds: string[]): Promise<void> {
    if (this.options.skipApiCleanup || postIds.length === 0) {
      return;
    }

    const authToken = this.options.authToken || (await this.getAuthToken());
    if (!authToken) {
      console.warn('⚠️  No auth token available for post cleanup');
      return;
    }

    for (const postId of postIds) {
      await this.deletePost(postId, authToken);
    }
  }

  /**
   * Clean up uploaded files by URLs
   */
  async cleanupFiles(fileUrls: string[]): Promise<void> {
    if (this.options.skipFileCleanup || fileUrls.length === 0) {
      return;
    }

    const authToken = this.options.authToken || (await this.getAuthToken());
    if (!authToken) {
      console.warn('⚠️  No auth token available for file cleanup');
      return;
    }

    for (const fileUrl of fileUrls) {
      await this.deleteFile(fileUrl, authToken);
    }
  }

  /**
   * Clean up users by IDs (use with caution)
   */
  async cleanupUsers(userIds: string[]): Promise<void> {
    if (this.options.skipApiCleanup || userIds.length === 0) {
      return;
    }

    const authToken = this.options.authToken || (await this.getAuthToken());
    if (!authToken) {
      console.warn('⚠️  No auth token available for user cleanup');
      return;
    }

    for (const userId of userIds) {
      await this.deleteUser(userId, authToken);
    }
  }

  /**
   * Clean up all test data created in the last N hours
   */
  async cleanupTestDataByAge(hours: number = 24): Promise<void> {
    if (this.options.skipApiCleanup) {
      return;
    }

    const authToken = this.options.authToken || (await this.getAuthToken());
    if (!authToken) {
      console.warn('⚠️  No auth token available for age-based cleanup');
      return;
    }

    try {
      const response = await fetch(`${this.options.baseUrl}/test/cleanup`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          older_than_hours: hours,
          cleanup_posts: true,
          cleanup_files: true,
          cleanup_test_users: false, // Be careful with this
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          `✅ Cleaned up ${result.posts_deleted} posts and ${result.files_deleted} files`,
        );
      } else {
        console.warn(
          `⚠️  Age-based cleanup failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.warn('⚠️  Age-based cleanup error:', error);
    }
  }

  /**
   * Get auth token from browser storage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await this.page.evaluate(() => {
        return (
          localStorage.getItem('authToken') ||
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('authToken') ||
          sessionStorage.getItem('access_token')
        );
      });
    } catch (error) {
      console.warn('Could not get auth token:', error);
      return null;
    }
  }

  /**
   * Delete a single post
   */
  private async deletePost(postId: string, authToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.options.baseUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (this.options.verbose) {
          console.log(`✅ Deleted post: ${postId}`);
        }
      } else {
        console.warn(
          `⚠️  Failed to delete post ${postId}: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.warn(`⚠️  Error deleting post ${postId}:`, error);
    }
  }

  /**
   * Delete a single file
   */
  private async deleteFile(fileUrl: string, authToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.options.baseUrl}/upload/cleanup`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl }),
      });

      if (response.ok) {
        if (this.options.verbose) {
          console.log(`✅ Deleted file: ${fileUrl}`);
        }
      } else {
        console.warn(
          `⚠️  Failed to delete file ${fileUrl}: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.warn(`⚠️  Error deleting file ${fileUrl}:`, error);
    }
  }

  /**
   * Delete a single user
   */
  private async deleteUser(userId: string, authToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.options.baseUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (this.options.verbose) {
          console.log(`✅ Deleted user: ${userId}`);
        }
      } else {
        console.warn(
          `⚠️  Failed to delete user ${userId}: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.warn(`⚠️  Error deleting user ${userId}:`, error);
    }
  }

  /**
   * Verify cleanup was successful
   */
  async verifyCleanup(
    postIds: string[],
    fileUrls: string[],
  ): Promise<{ posts: string[]; files: string[] }> {
    const failedPosts: string[] = [];
    const failedFiles: string[] = [];

    const authToken = await this.getAuthToken();
    if (!authToken) {
      return { posts: postIds, files: fileUrls };
    }

    // Verify posts were deleted
    for (const postId of postIds) {
      try {
        const response = await fetch(
          `${this.options.baseUrl}/posts/${postId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );

        if (response.status !== 404) {
          failedPosts.push(postId);
        }
      } catch {
        // Network error, assume post still exists
        failedPosts.push(postId);
      }
    }

    // Verify files were deleted (this depends on your API)
    for (const fileUrl of fileUrls) {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (response.ok) {
          failedFiles.push(fileUrl);
        }
      } catch {
        // Network error, assume file still exists
        failedFiles.push(fileUrl);
      }
    }

    return { posts: failedPosts, files: failedFiles };
  }
}
