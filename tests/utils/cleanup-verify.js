#!/usr/bin/env node

/**
 * Test Data Cleanup Verification Script
 *
 * This script helps verify that test data cleanup is working correctly.
 * It can be run after tests to ensure no test data remains.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.test' });

const BASE_URL = process.env.VITE_BE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

/**
 * Get auth token for API calls
 */
async function getAuthToken() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token || data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Check for test posts that weren't cleaned up
 */
async function checkForTestPosts(authToken) {
  try {
    const response = await fetch(`${BASE_URL}/posts?search=test&limit=100`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.ok) {
      const data = await response.json();
      const testPosts =
        data.posts?.filter(
          (post) =>
            post.title.toLowerCase().includes('test') ||
            post.description.toLowerCase().includes('test'),
        ) || [];

      return testPosts;
    }
    return [];
  } catch (error) {
    console.error('Failed to check for test posts:', error);
    return [];
  }
}

/**
 * Check for test files that weren't cleaned up
 */
async function checkForTestFiles() {
  const testUploadsPath = process.env.TEST_STORAGE_PATH || './public/uploads';

  if (!fs.existsSync(testUploadsPath)) {
    return [];
  }

  try {
    const files = fs.readdirSync(testUploadsPath);
    const testFiles = files.filter(
      (file) =>
        file.includes('test') ||
        file.includes('Test') ||
        file.includes('integration'),
    );

    return testFiles.map((file) => path.join(testUploadsPath, file));
  } catch (error) {
    console.error('Failed to check for test files:', error);
    return [];
  }
}

/**
 * Clean up old test data
 */
async function cleanupOldTestData(authToken) {
  try {
    const response = await fetch(`${BASE_URL}/test/cleanup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        older_than_hours: 24,
        cleanup_posts: true,
        cleanup_files: true,
        cleanup_test_users: false,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(
        `✅ Cleaned up ${result.posts_deleted} posts and ${result.files_deleted} files`,
      );
      return result;
    } else {
      console.warn(`⚠️  Cleanup API returned ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Failed to cleanup old test data:', error);
    return null;
  }
}

/**
 * Main verification function
 */
async function verifyCleanup() {
  console.log('🔍 Verifying test data cleanup...');

  const authToken = await getAuthToken();
  if (!authToken) {
    console.error('❌ Could not authenticate - skipping API checks');
    return;
  }

  // Check for remaining test posts
  const testPosts = await checkForTestPosts(authToken);
  if (testPosts.length > 0) {
    console.warn(
      `⚠️  Found ${testPosts.length} test posts that weren't cleaned up:`,
    );
    testPosts.forEach((post) => {
      console.log(
        `  - ${post.id}: ${post.title} (created: ${post.created_at})`,
      );
    });
  } else {
    console.log('✅ No test posts found');
  }

  // Check for remaining test files
  const testFiles = await checkForTestFiles();
  if (testFiles.length > 0) {
    console.warn(
      `⚠️  Found ${testFiles.length} test files that weren't cleaned up:`,
    );
    testFiles.forEach((file) => {
      console.log(`  - ${file}`);
    });
  } else {
    console.log('✅ No test files found');
  }

  // Clean up old test data
  console.log('\n🧹 Cleaning up old test data...');
  await cleanupOldTestData(authToken);

  console.log('\n✅ Cleanup verification completed');
}

/**
 * Run specific cleanup commands
 */
async function runCleanupCommand(command) {
  const authToken = await getAuthToken();
  if (!authToken) {
    console.error('❌ Could not authenticate');
    return;
  }

  switch (command) {
    case 'posts':
      console.log('🧹 Cleaning up test posts...');
      const testPosts = await checkForTestPosts(authToken);
      for (const post of testPosts) {
        try {
          const response = await fetch(`${BASE_URL}/posts/${post.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (response.ok) {
            console.log(`✅ Deleted post: ${post.id}`);
          } else {
            console.warn(`⚠️  Failed to delete post ${post.id}`);
          }
        } catch (error) {
          console.error(`❌ Error deleting post ${post.id}:`, error);
        }
      }
      break;

    case 'files':
      console.log('🧹 Cleaning up test files...');
      const testFiles = await checkForTestFiles();
      for (const file of testFiles) {
        try {
          fs.unlinkSync(file);
          console.log(`✅ Deleted file: ${file}`);
        } catch (error) {
          console.error(`❌ Error deleting file ${file}:`, error);
        }
      }
      break;

    case 'all':
      await runCleanupCommand('posts');
      await runCleanupCommand('files');
      break;

    default:
      console.log('Usage: node cleanup-verify.js [verify|posts|files|all]');
  }
}

// Main execution
const command = process.argv[2] || 'verify';

if (command === 'verify') {
  verifyCleanup();
} else {
  runCleanupCommand(command);
}
