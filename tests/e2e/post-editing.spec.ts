import { expect, test } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Post Editing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Login with test user
    await helpers.loginWithTestUser();
  });

  test.afterEach(async () => {
    // Cleanup after each test to prevent interference
    await helpers.cleanup();
  });

  test('@unsafe SCRUM-356-7: Post Editing - Update Existing Post', async ({
    page,
  }) => {
    // Navigate to an existing post
    await page.goto('/post/123');

    // Click edit button
    const editButton = page.locator(
      'button:has-text("Edit"), [data-testid="edit-button"], .edit-button',
    );
    await editButton.click();

    // Verify edit page loads with current data
    await expect(page).toHaveURL(/.*\/edit.*|.*\/post\/123\/edit/);

    // Verify fields are populated with existing data
    await expect(page.locator('input[name="title"]')).toHaveValue(
      'Original Test Post',
    );
    await expect(page.locator('textarea[name="description"]')).toHaveValue(
      'Original description',
    );

    // Verify existing media is displayed
    await expect(page.locator('.media-preview-item')).toHaveCount(2);

    // Modify the title
    await helpers.fillField('input[name="title"]', 'Updated Test Post');

    // Update the description
    await helpers.fillField(
      'textarea[name="description"]',
      'Updated description with more details',
    );

    // Add a new image to existing media
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('tests/fixtures/image3.jpg');

    // Verify new image is added
    await expect(page.locator('.media-preview-item')).toHaveCount(3);

    // Remove one existing image
    const removeButton = page
      .locator('.remove-image, [data-testid="remove-media"]')
      .first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
      await expect(page.locator('.media-preview-item')).toHaveCount(2);
    }

    // Change thumbnail by uploading new one
    const thumbnailInput = page.locator(
      'input[type="file"][aria-label*="thumbnail"]',
    );
    if ((await thumbnailInput.count()) > 0) {
      await thumbnailInput.setInputFiles('tests/fixtures/thumbnail.jpg');
    }

    // Update categories
    const categorySelector = page.locator('.category-selector, .categories');
    if (await categorySelector.isVisible()) {
      await categorySelector.click();
      await page.locator('.category-option:has-text("landscape")').click();
    }

    // Submit changes
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Update"), button:has-text("Save")',
    );
    await submitButton.click();

    // Verify success
    await expect(
      page.locator(':text("Post updated successfully"), .success-message'),
    ).toBeVisible();

    // Verify redirection to updated post
    await expect(page).toHaveURL(/.*\/post\/123(?!\/edit)/);

    // Verify updated content is displayed
    await expect(page.locator('h1, .post-title')).toContainText(
      'Updated Test Post',
    );
    await expect(page.locator('.post-description')).toContainText(
      'Updated description',
    );
  });

  test('@unsafe SCRUM-356-6: Thumbnail Cropping Functionality', async ({
    page,
  }) => {
    // Navigate to edit page
    await page.goto('/post/123/edit');

    // Wait for page to load
    await helpers.waitForElement('input[name="title"]');

    // Upload a thumbnail image
    const thumbnailInput = page.locator(
      'input[type="file"][aria-label*="thumbnail"]',
    );
    if ((await thumbnailInput.count()) > 0) {
      await thumbnailInput.setInputFiles('tests/fixtures/thumbnail.jpg');
    }

    // Click crop button
    const cropButton = page.locator(
      'button:has-text("Crop"), [data-testid="crop-button"], .crop-icon',
    );
    if (await cropButton.isVisible()) {
      await cropButton.click();

      // Verify crop modal opens
      await expect(
        page.locator('.crop-modal, [data-testid="crop-modal"]'),
      ).toBeVisible();

      // Test crop area adjustment (simulate drag)
      const cropArea = page.locator('.crop-area, .react-crop');
      if (await cropArea.isVisible()) {
        await cropArea.hover();
        await page.mouse.down();
        await page.mouse.move(100, 100);
        await page.mouse.up();
      }

      // Test zoom controls
      const zoomIn = page.locator(
        'button:has-text("+"), [data-testid="zoom-in"]',
      );
      if (await zoomIn.isVisible()) {
        await zoomIn.click();
      }

      const zoomOut = page.locator(
        'button:has-text("-"), [data-testid="zoom-out"]',
      );
      if (await zoomOut.isVisible()) {
        await zoomOut.click();
      }

      // Apply crop
      const applyButton = page.locator(
        'button:has-text("Apply"), button:has-text("Save"), [data-testid="apply-crop"]',
      );
      await applyButton.click();

      // Verify crop modal closes
      await expect(page.locator('.crop-modal')).not.toBeVisible();

      // Verify cropped thumbnail is displayed
      await expect(
        page.locator('.thumbnail-preview, .cropped-thumbnail'),
      ).toBeVisible();
    }

    // Complete post update
    await helpers.fillField(
      'input[name="title"]',
      'Post with Cropped Thumbnail',
    );

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify success
    await expect(
      page.locator(':text("Post updated successfully")'),
    ).toBeVisible();
  });

  test('@unsafe SCRUM-356-5: Mature Content Detection', async ({ page }) => {
    // Navigate to create post page
    await page.goto('/upload');

    // Upload an image that triggers mature content detection
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles('tests/fixtures/image1.jpg');

    // Wait for content analysis
    await helpers.waitForNetworkIdle();

    // Verify mature content checkbox is auto-checked and disabled
    const matureCheckbox = page.locator(
      'input[type="checkbox"][name="mature_content"], [data-testid="mature-content-checkbox"]',
    );
    await expect(matureCheckbox).toBeChecked();
    await expect(matureCheckbox).toBeDisabled();

    // Verify explanation text is shown
    await expect(
      page.locator(
        ':text("mature content"), :text("guidelines"), .mature-content-warning',
      ),
    ).toBeVisible();

    // Verify user cannot uncheck the flag
    await matureCheckbox.click();
    await expect(matureCheckbox).toBeChecked();

    // Complete post creation
    await helpers.fillField(
      'input[name="title"]',
      'Test Post with Mature Content',
    );
    await helpers.fillField(
      'textarea[name="description"]',
      'This post contains mature content',
    );

    await page.locator('button[type="submit"]').click();

    // Verify post is created with mature content flag
    await expect(
      page.locator(':text("Post successfully created!")'),
    ).toBeVisible();
    await expect(
      page.locator('.mature-content-indicator, [data-testid="mature-flag"]'),
    ).toBeVisible();
  });
});
