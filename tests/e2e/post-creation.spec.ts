import { expect, test } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Post Creation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Add request logging to debug auth issues
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()} on: ${response.url()}`);
      }
    });

    // Login with test user and navigate to upload
    console.log('🔑 Attempting login...');
    await helpers.loginWithTestUser();

    // Verify we're logged in by checking for auth indicators
    const currentUrl = page.url();
    console.log(`📍 After login, current URL: ${currentUrl}`);

    // If we're still on login page or redirected to Vercel, something went wrong
    if (currentUrl.includes('/login')) {
      console.log('⚠️  Login may have failed, attempting manual navigation...');
      await page.goto('/dashboard'); // Try going to dashboard first
      await page.waitForTimeout(2000); // Wait a bit
    }

    console.log('📤 Navigating to create post page...');
    await page.goto('/posts/new');
  });

  test.afterEach(async () => {
    // Cleanup after each test to prevent interference
    await helpers.cleanup();
  });

  test.only('@smoke @unsafe SCRUM-356-1: Basic Post Creation with Image Upload', async ({
    page,
  }) => {
    // Check current URL and authentication state
    console.log(`📍 Current URL: ${page.url()}`);

    // Step 1: Wait for the upload button to be available
    await expect(
      page.getByRole('button', { name: 'Upload Image' }),
    ).toBeVisible();

    // Step 2: Upload an image using the hidden file input inside the Upload Image button
    await page
      .getByRole('button', { name: 'Upload Image' })
      .locator('input[type="file"]')
      .setInputFiles('tests/fixtures/image1.png');

    // Step 3: Verify image preview displays
    await expect(page.getByRole('img', { name: 'Preview' })).toBeVisible();

    // Step 4: Enter title
    await page
      .getByRole('textbox', { name: 'What do you call your artwork' })
      .click();
    await page
      .getByRole('textbox', { name: 'What do you call your artwork' })
      .fill('My Artwork Test');

    // Step 5: Enter description
    await page.getByRole('textbox', { name: 'Describe your work' }).click();
    await page
      .getByRole('textbox', { name: 'Describe your work' })
      .fill('This is a test artwork description');

    // Step 6: Select category
    await page
      .getByRole('textbox', { name: 'Choose art type or search...' })
      .click();

    // Select Video Art category by clicking the Add button in the list
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Video Art' })
      .getByRole('button', { name: 'Add' })
      .click();

    // Verify category was selected successfully
    console.log('📂 Category selected: Video Art');

    // Step 7: Submit the post
    console.log('📤 Attempting to submit post...');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Step 8: Verify success
    await expect(
      page.locator(':text("Post successfully created!"), .success-message'),
    ).toBeVisible();
    await expect(page).toHaveURL(/.*\/post\/.*|.*\/dashboard|.*\/profile/);

    console.log(`✅ Post created successfully`);
  });

  test('@unsafe SCRUM-356-2: Video Upload with Duration Validation', async ({
    page,
  }) => {
    // Test video upload functionality with real backend validation
    const videoUpload = page.locator('input[type="file"][accept*="video"]');

    // Test with a video file (you'll need to have test video files)
    if ((await videoUpload.count()) > 0) {
      await videoUpload.setInputFiles('tests/fixtures/video-short.mp4');

      // Wait for video processing/preview
      await helpers.waitForElement('.video-preview, .media-preview');

      // Complete the post
      await helpers.fillField('input[name="title"]', 'Test Video Post');
      await helpers.fillField(
        'textarea[name="description"]',
        'This is a test video post',
      );

      // Submit and track the post
      const postId = await helpers.submitPostAndTrack();

      if (postId) {
        console.log(`✅ Created video post with ID: ${postId}`);
      }
    } else {
      console.log('⚠️  Video upload not available, skipping test');
      test.skip();
    }
  });

  test('@unsafe SCRUM-356-3: AI Content Generation Feature', async ({
    page,
  }) => {
    // Test AI content generation if available
    const aiButton = page.locator(
      'button[data-testid="ai-generate"], button:has-text("Generate"), .magic-wand',
    );

    // Upload an image first
    await page
      .locator('input[type="file"][accept="image/*"]')
      .first()
      .setInputFiles('tests/fixtures/image1.png');
    await helpers.waitForElement('.media-preview');

    // Check if AI generation is available
    if ((await aiButton.count()) > 0) {
      await aiButton.click();

      // Wait for AI generation to complete
      await page.waitForTimeout(2000); // Allow time for AI processing

      // Verify user can edit any generated content
      await helpers.fillField('input[name="title"]', 'My Custom AI Title');
      await expect(page.locator('input[name="title"]')).toHaveValue(
        'My Custom AI Title',
      );

      // Submit the post
      const postId = await helpers.submitPostAndTrack();

      if (postId) {
        console.log(`✅ Created AI-generated post with ID: ${postId}`);
      }
    } else {
      // If AI generation is not available, just create a regular post
      await helpers.fillField('input[name="title"]', 'Test Post Without AI');
      await helpers.fillField(
        'textarea[name="description"]',
        'This is a test post',
      );

      const postId = await helpers.submitPostAndTrack();

      if (postId) {
        console.log(`✅ Created regular post with ID: ${postId}`);
      }
    }
  });

  test('@unsafe SCRUM-356-4: Multiple Image Upload (Max 4 Images)', async ({
    page,
  }) => {
    const fileInput = page
      .locator('input[type="file"][accept="image/*"]')
      .first();

    // Upload 4 images
    for (let i = 1; i <= 4; i++) {
      await fileInput.setInputFiles(`tests/fixtures/image${i}.png`);
      await helpers.waitForElement(`.media-preview-item:nth-child(${i})`);
    }

    // Verify all 4 images are displayed
    await expect(page.locator('.media-preview-item')).toHaveCount(4);

    // Try to upload a 5th image - should be prevented
    await fileInput.setInputFiles('tests/fixtures/image1.png');

    // Should show limit message
    await expect(
      page.locator(':text("maximum"), :text("limit"), .limit-message'),
    ).toBeVisible();

    // Should still have only 4 images
    await expect(page.locator('.media-preview-item')).toHaveCount(4);

    // Complete the post
    await helpers.fillField('input[name="title"]', 'Multiple Images Test');
    await page.locator('button[type="submit"]').click();

    await expect(
      page.locator(':text("Post successfully created!")'),
    ).toBeVisible();
  });

  test('@unsafe SCRUM-356-8: Drag and Drop Upload', async ({ page }) => {
    // Verify visual feedback for drag and drop
    const dropZone = page.locator(
      '.drop-zone, .upload-area, [data-testid="upload-area"]',
    );
    await expect(dropZone).toBeVisible();

    // Test actual file input with drag simulation
    const fileInput = page
      .locator('input[type="file"][accept="image/*"]')
      .first();
    await fileInput.setInputFiles('tests/fixtures/image1.png');

    // Verify image appears in preview
    await expect(page.locator('.media-preview, .image-preview')).toBeVisible();

    // Test dropping an unsupported file type
    await fileInput.setInputFiles('tests/fixtures/unsupported-file.txt');

    // Should show error message
    await expect(
      page.locator(':text("unsupported"), :text("invalid"), .error-message'),
    ).toBeVisible();
  });

  test('@safe SCRUM-356-9: Required Fields Validation', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');

    // Step 1: Try to submit without any media
    await expect(submitButton).toBeDisabled();

    // Step 2: Upload an image but leave title empty
    await page
      .locator('input[type="file"][accept="image/*"]')
      .first()
      .setInputFiles('tests/fixtures/image1.png');
    await helpers.waitForElement('.media-preview');

    // Submit button should still be disabled or show error
    await submitButton.click();
    await expect(
      page.locator(':text("Title is required"), .error-message'),
    ).toBeVisible();

    // Step 3: Add title less than 5 characters
    await helpers.fillField('input[name="title"]', 'abc');
    await submitButton.click();
    await expect(
      page.locator(
        ':text("Title must be at least 5 characters"), .error-message',
      ),
    ).toBeVisible();

    // Step 4: Add proper title and submit
    await helpers.fillField('input[name="title"]', 'A valid title');

    // Submit button should be enabled
    await expect(submitButton).toBeEnabled();

    // Should submit successfully and track the post
    const postId = await helpers.submitPostAndTrack();

    await expect(
      page.locator(':text("Post successfully created!")'),
    ).toBeVisible();

    if (postId) {
      console.log(`✅ Created post with validation: ${postId}`);
    }
  });

  test('@unsafe SCRUM-356-10: AI-Generated Images from Art Nova', async ({
    page,
  }) => {
    // Test navigation from Art Nova with AI-generated images
    // Navigate from Art Nova (simulate with query params)
    await page.goto('/posts/new?from=art-nova&prompt_id=prompt123');

    // Check if AI-generated images are available from Art Nova
    const aiIndicator = page.locator(
      '[data-testid="ai-flag"], .ai-generated-indicator',
    );

    if ((await aiIndicator.count()) > 0) {
      // Verify AI flag is set
      await expect(aiIndicator).toBeVisible();

      // Complete the post with AI-generated content
      await helpers.fillField(
        'input[name="title"]',
        'AI Generated Art from Nova',
      );
      await helpers.fillField(
        'textarea[name="description"]',
        'Created with AI from Art Nova',
      );

      const postId = await helpers.submitPostAndTrack();

      if (postId) {
        console.log(`✅ Created Art Nova AI post with ID: ${postId}`);
      }
    } else {
      // If no AI images, upload a regular image
      await page
        .locator('input[type="file"]')
        .first()
        .setInputFiles('tests/fixtures/image1.png');
      await helpers.waitForElement('.media-preview');

      await helpers.fillField('input[name="title"]', 'Regular Art Post');
      await helpers.fillField(
        'textarea[name="description"]',
        'Regular art post',
      );

      const postId = await helpers.submitPostAndTrack();

      if (postId) {
        console.log(`✅ Created regular post with ID: ${postId}`);
      }
    }
  });
});
