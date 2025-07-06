import { expect, test } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Post Creation Integration Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Login with real credentials
    await helpers.loginWithTestUser();
    await page.goto('/posts/new');
  });

  test.afterEach(async () => {
    // Cleanup after each test to prevent interference
    await helpers.cleanup();
  });

  test('@integration @unsafe Real Post Creation with Image Upload', async ({
    page,
  }) => {
    // Step 1: Navigate to Create Post page (already done in beforeEach)
    await helpers.waitForElement('input[type="file"][accept="image/*"]');

    // Step 2: Upload an image
    const imageUpload = page
      .locator('input[type="file"][accept="image/*"]')
      .first();
    await imageUpload.setInputFiles('tests/fixtures/image1.jpg');

    // Step 3: Verify image preview displays
    await expect(page.locator('.media-preview, .image-preview')).toBeVisible();

    // Step 4: Enter title with timestamp to make it unique
    const timestamp = new Date().getTime();
    const title = `Integration Test Post ${timestamp}`;
    await helpers.fillField(
      'input[name="title"], input[placeholder*="title"]',
      title,
    );

    // Step 5: Enter description
    await helpers.fillField(
      'textarea[name="description"], textarea[placeholder*="description"]',
      'This is an integration test post that creates real data',
    );

    // Step 6: Select category if available
    const categorySelector = page
      .locator('.category-selector, .categories')
      .first();
    if (await categorySelector.isVisible()) {
      await categorySelector.click();
      await page.locator('.category-option, .category-item').first().click();
    }

    // Step 7: Submit the post and track creation
    const postId = await helpers.submitPostAndTrack();

    // Verify success
    await expect(
      page.locator(':text("Post successfully created!"), .success-message'),
    ).toBeVisible();

    // Navigate to the created post to verify it exists
    if (postId) {
      console.log(`✅ Created real post with ID: ${postId}`);
      await page.goto(`/post/${postId}`);

      // Verify post content
      await expect(page.locator('h1, .post-title')).toContainText(title);
      await expect(page.locator('.post-description')).toContainText(
        'This is an integration test post',
      );
      await expect(page.locator('.post-image, .media-content')).toBeVisible();
    }
  });

  test('@integration @unsafe Real Multiple Image Post Creation', async ({
    page,
  }) => {
    const fileInput = page
      .locator('input[type="file"][accept="image/*"]')
      .first();
    const timestamp = new Date().getTime();

    // Upload multiple images
    await fileInput.setInputFiles('tests/fixtures/image1.jpg');
    await helpers.waitForElement('.media-preview-item');

    // Add second image if supported
    try {
      await fileInput.setInputFiles('tests/fixtures/image2.jpg');
      await helpers.waitForElement('.media-preview-item:nth-child(2)');
    } catch {
      console.log('Single image upload mode detected');
    }

    // Complete the post
    await helpers.fillField(
      'input[name="title"]',
      `Multiple Images Test ${timestamp}`,
    );
    await helpers.fillField(
      'textarea[name="description"]',
      'Integration test with multiple images',
    );

    // Submit and track
    const postId = await helpers.submitPostAndTrack();

    // Verify creation
    await expect(
      page.locator(':text("Post successfully created!")'),
    ).toBeVisible();

    if (postId) {
      console.log(`✅ Created multi-image post with ID: ${postId}`);

      // Verify the post exists
      await page.goto(`/post/${postId}`);
      await expect(page.locator('h1, .post-title')).toContainText(
        `Multiple Images Test ${timestamp}`,
      );
      await expect(page.locator('.post-image, .media-content')).toBeVisible();
    }
  });

  test('@integration @unsafe Real Video Post Creation', async ({ page }) => {
    // Skip if no video upload support
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    if ((await videoInput.count()) === 0) {
      test.skip();
    }

    const timestamp = new Date().getTime();

    // Upload video
    await videoInput.setInputFiles('tests/fixtures/video-short.mp4');
    await helpers.waitForElement('.video-preview, .media-preview');

    // Complete the post
    await helpers.fillField('input[name="title"]', `Video Test ${timestamp}`);
    await helpers.fillField(
      'textarea[name="description"]',
      'Integration test video post',
    );

    // Submit and track
    const postId = await helpers.submitPostAndTrack();

    // Verify creation
    await expect(
      page.locator(':text("Post successfully created!")'),
    ).toBeVisible();

    if (postId) {
      console.log(`✅ Created video post with ID: ${postId}`);

      // Verify the post exists
      await page.goto(`/post/${postId}`);
      await expect(page.locator('h1, .post-title')).toContainText(
        `Video Test ${timestamp}`,
      );
      await expect(page.locator('.post-video, .media-content')).toBeVisible();
    }
  });

  test('@integration @unsafe Real Post Creation with File Upload Tracking', async ({
    page,
  }) => {
    const timestamp = new Date().getTime();

    // Upload file and track the upload
    const fileInput = page
      .locator('input[type="file"][accept="image/*"]')
      .first();
    await fileInput.setInputFiles('tests/fixtures/image1.jpg');
    await helpers.waitForElement('.media-preview');

    // Listen for upload API calls to track uploaded files
    page.on('response', async (response) => {
      if (
        response.url().includes('/upload') &&
        response.request().method() === 'POST'
      ) {
        try {
          const responseData = await response.json();
          if (responseData.file_url || responseData.url) {
            const fileUrl = responseData.file_url || responseData.url;
            helpers.trackUploadedFile(fileUrl);
            console.log(`📎 Tracked uploaded file: ${fileUrl}`);
          }
        } catch (error) {
          console.warn('Could not track uploaded file:', error);
        }
      }
    });

    // Complete the post
    await helpers.fillField(
      'input[name="title"]',
      `Upload Tracking Test ${timestamp}`,
    );
    await helpers.fillField(
      'textarea[name="description"]',
      'Integration test with file upload tracking',
    );

    // Submit and track
    const postId = await helpers.submitPostAndTrack();

    await expect(
      page.locator(':text("Post successfully created!")'),
    ).toBeVisible();

    if (postId) {
      console.log(`✅ Created post with file tracking: ${postId}`);
    }
  });
});
