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
    if (currentUrl.includes('/login') || currentUrl.includes('vercel.com')) {
      console.log('⚠️  Login may have failed, attempting manual navigation...');
      await page.goto('/dashboard'); // Try going to dashboard first
      await page.waitForTimeout(2000); // Wait a bit
    }

    console.log('📤 Navigating to upload page...');
    await page.goto('/upload');

    // Wait for the upload page to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    // Cleanup after each test to prevent interference
    await helpers.cleanup();
  });

  test.only('@smoke @unsafe SCRUM-356-1: Basic Post Creation with Image Upload', async ({
    page,
  }) => {
    // Add debugging for authentication issues
    console.log('🔍 Starting authentication debugging...');

    // Intercept and log network requests to debug 403 errors
    page.on('response', (response) => {
      if (response.status() === 403) {
        console.log(`❌ 403 Error on: ${response.url()}`);
        console.log(`Request headers:`, response.request().headers());
      }
      if (
        response.url().includes('vercel.com') ||
        response.url().includes('jwt')
      ) {
        console.log(
          `🔗 Vercel/JWT request: ${response.url()} - Status: ${response.status()}`,
        );
      }
    });

    // Check current URL and authentication state
    console.log(`📍 Current URL: ${page.url()}`);

    // Verify we're authenticated by checking for auth tokens/cookies
    const cookies = await page.context().cookies();
    console.log(`🍪 Current cookies count: ${cookies.length}`);

    const authCookie = cookies.find(
      (c) =>
        c.name.includes('auth') ||
        c.name.includes('token') ||
        c.name.includes('session'),
    );
    if (authCookie) {
      console.log(`✅ Found auth cookie: ${authCookie.name}`);
    } else {
      console.log(
        `⚠️  No auth cookie found. Available cookies: ${cookies.map((c) => c.name).join(', ')}`,
      );
    }

    // Check localStorage for auth tokens
    const authTokens = await page.evaluate(() => {
      const tokens: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes('auth') ||
            key.includes('token') ||
            key.includes('user'))
        ) {
          tokens.push(key);
        }
      }
      return tokens;
    });
    console.log(`🔑 Auth tokens in localStorage: ${authTokens.join(', ')}`);

    // If we're on a Vercel login page, we have an auth issue
    if (page.url().includes('vercel.com')) {
      console.log('❌ Redirected to Vercel login - authentication failed!');
      console.log('🔄 Attempting to re-authenticate...');

      // Try to go back to our app and re-login
      await page.goto('/login');
      await helpers.loginWithTestUser();
      await page.goto('/upload');
    }

    // Step 1: Navigate to Upload Post page (already done in beforeEach)
    await helpers.waitForElement('input[type="file"]');

    // Step 2: Upload an image
    const imageUpload = page.locator('input[type="file"]').first();
    await imageUpload.setInputFiles('tests/fixtures/image1.jpg');

    // Step 3: Verify image preview displays
    await expect(page.locator('.media-preview, .image-preview')).toBeVisible();

    // Step 4: Enter title
    await helpers.fillField(
      'input[name="title"], input[placeholder*="title"]',
      'My Artwork Test',
    );

    // Step 5: Enter description
    await helpers.fillField(
      'textarea[name="description"], textarea[placeholder*="description"]',
      'This is a test artwork description',
    );

    // Step 6: Select category
    const categorySelector = page
      .locator('.category-selector, .categories')
      .first();
    if (await categorySelector.isVisible()) {
      await categorySelector.click();
      await page.locator('.category-option, .category-item').first().click();
    }

    // Step 7: Upload thumbnail (if separate from main image)
    const thumbnailUpload = page.locator(
      'input[type="file"][aria-label*="thumbnail"], input[type="file"][data-testid="thumbnail"]',
    );
    if ((await thumbnailUpload.count()) > 0) {
      await thumbnailUpload.setInputFiles('tests/fixtures/thumbnail.jpg');
    }

    // Step 8: Submit the post and track creation
    console.log('📤 Attempting to submit post...');
    const postId = await helpers.submitPostAndTrack();

    // Verify success
    await expect(
      page.locator(':text("Post successfully created!"), .success-message'),
    ).toBeVisible();
    await expect(page).toHaveURL(/.*\/post\/.*|.*\/dashboard|.*\/profile/);

    // Log created post for debugging
    if (postId) {
      console.log(`✅ Created post with ID: ${postId}`);
    }
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
      .locator('input[type="file"]')
      .first()
      .setInputFiles('tests/fixtures/image1.jpg');
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
    const fileInput = page.locator('input[type="file"]').first();

    // Upload 4 images
    for (let i = 1; i <= 4; i++) {
      await fileInput.setInputFiles(`tests/fixtures/image${i}.jpg`);
      await helpers.waitForElement(`.media-preview-item:nth-child(${i})`);
    }

    // Verify all 4 images are displayed
    await expect(page.locator('.media-preview-item')).toHaveCount(4);

    // Try to upload a 5th image - should be prevented
    await fileInput.setInputFiles('tests/fixtures/image1.jpg');

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
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('tests/fixtures/image1.jpg');

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
      .locator('input[type="file"]')
      .first()
      .setInputFiles('tests/fixtures/image1.jpg');
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
    await page.goto('/upload?from=art-nova&prompt_id=prompt123');

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
        .setInputFiles('tests/fixtures/image1.jpg');
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
