import { expect, Locator, Page, Response } from '@playwright/test';

export class PostCreationPage {
  // Locators as private properties for better performance and reusability
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly categorySelector: Locator;
  private readonly uploadImageButton: Locator;
  private readonly uploadVideoButton: Locator;
  private readonly submitButton: Locator;
  private readonly aiGenerateButton: Locator;
  private readonly previewImage: Locator;
  private readonly previewVideo: Locator;
  private readonly thumbnailImage: Locator;

  constructor(private page: Page) {
    // Initialize locators once in constructor
    this.titleInput = this.page.getByRole('textbox', {
      name: 'What do you call your artwork',
    });
    this.descriptionInput = this.page.getByRole('textbox', {
      name: 'Describe your work',
    });
    this.categorySelector = this.page.getByRole('textbox', {
      name: 'Choose art type or search...',
    });
    this.uploadImageButton = this.page.getByRole('button', {
      name: 'Upload Image',
    });
    this.uploadVideoButton = this.page.getByRole('button', {
      name: 'Upload Video',
    });
    this.submitButton = this.page.getByRole('button', { name: 'Submit' });
    this.aiGenerateButton = this.page.getByRole('button', {
      name: 'Auto generate content (title, description, categories) - Credit cost: ~2',
    });
    this.previewImage = this.page.getByRole('img', { name: 'Preview' });
    this.previewVideo = this.page.locator('video');
    this.thumbnailImage = this.page.getByRole('img', { name: 'Thumbnail' });
  }

  // Form filling methods
  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async fillForm(title: string, description: string): Promise<void> {
    await this.fillTitle(title);
    await this.fillDescription(description);
  }

  // Category selection
  async selectFirstCategory(): Promise<void> {
    await this.categorySelector.click();

    const categoryList = this.page.locator(
      'ul.custom-scroll.flex-1.space-y-2.overflow-y-auto.pr-1 li',
    );
    await categoryList.first().getByRole('button', { name: 'Add' }).click();
  }

  // File upload methods
  async uploadImage(filename = 'tests/fixtures/image1.png'): Promise<void> {
    await expect(this.uploadImageButton).toBeVisible();

    const fileInput = this.uploadImageButton.locator('input[type="file"]');
    await fileInput.setInputFiles(filename);

    await expect(this.previewImage).toBeVisible();
  }

  async uploadVideo(
    filename = 'tests/fixtures/video-short.mp4',
  ): Promise<void> {
    await expect(this.uploadVideoButton).toBeVisible();

    const fileInput = this.uploadVideoButton.locator('input[type="file"]');
    await fileInput.setInputFiles(filename);

    await expect(this.previewVideo).toBeVisible({ timeout: 20000 });
  }

  // AI content generation
  async generateAIContent(): Promise<{
    success: boolean;
    title?: string;
    description?: string;
  }> {
    if (!(await this.aiGenerateButton.isVisible())) {
      return { success: false };
    }

    const aiGenerationPromise = this.page.waitForResponse(
      (response: Response) =>
        response.url().includes('/posts/generate-metadata') &&
        response.request().method() === 'POST',
    );

    await this.aiGenerateButton.click();
    const response = await aiGenerationPromise;
    expect(response.status()).toBe(201);

    // Return generated content for logging/verification
    const title = await this.titleInput.inputValue();
    const description = await this.descriptionInput.inputValue();

    return { success: true, title, description };
  }

  // Submit functionality
  async prepareForSubmit(): Promise<void> {
    // Close any open tooltips or popovers that might block the submit button
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  async submitPost(): Promise<Response> {
    await this.prepareForSubmit();

    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();

    const postCreationPromise = this.page.waitForResponse(
      (response: Response) =>
        response.url().includes('/posts') &&
        response.request().method() === 'POST',
    );

    await this.submitButton.click();
    return postCreationPromise;
  }

  // Validation helpers
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  async waitForSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async waitForSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  // AI Stock Image functionality
  async openAIStockImages(): Promise<void> {
    const aiImagesButton = this.page.getByRole('button', {
      name: 'Post My AI Images',
    });
    await expect(aiImagesButton).toBeVisible();
    await aiImagesButton.click();
  }

  async browseAIStock(): Promise<void> {
    await this.page
      .getByRole('button')
      .filter({ hasText: 'Browse My Stock' })
      .click();

    // Verify the AI images dialog is visible
    await expect(
      this.page
        .getByRole('paragraph')
        .filter({ hasText: 'Post With Your AI Images' }),
    ).toBeVisible();
  }

  async selectFirstAIImage(): Promise<boolean> {
    const postButton = this.page
      .getByRole('button', { name: 'Post this' })
      .first();
    await expect(postButton).toBeVisible();

    if (await postButton.isVisible()) {
      await postButton.click();
      await expect(this.previewImage).toBeVisible();
      return true;
    }
    return false;
  }

  async waitForThumbnail(): Promise<void> {
    await expect(this.thumbnailImage).toBeVisible();
  }

  async handleNoAIImagesAvailable(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Upload from Device (images,' })
      .click();
    await this.page
      .getByRole('button', { name: 'Yes, discard and switch' })
      .click();
  }

  // Combined workflow methods
  async createImagePost(
    title: string,
    description: string,
    imagePath?: string,
  ): Promise<void> {
    await this.uploadImage(imagePath);
    await this.fillForm(title, description);
    await this.selectFirstCategory();
  }

  async createVideoPost(
    title: string,
    description: string,
    videoPath?: string,
  ): Promise<void> {
    await this.uploadVideo(videoPath);
    await this.fillForm(title, description);
    await this.selectFirstCategory();
  }

  async createAIStockPost(title: string): Promise<boolean> {
    await this.openAIStockImages();
    await this.browseAIStock();

    const imageSelected = await this.selectFirstAIImage();
    if (imageSelected) {
      await this.fillTitle(title);
      await this.waitForThumbnail();
      return true;
    }

    // Fallback to regular upload
    await this.handleNoAIImagesAvailable();
    return false;
  }

  // Getter methods for external access
  getSubmitButton(): Locator {
    return this.submitButton;
  }

  getTitleInput(): Locator {
    return this.titleInput;
  }

  getDescriptionInput(): Locator {
    return this.descriptionInput;
  }

  getPreviewImage(): Locator {
    return this.previewImage;
  }

  getPreviewVideo(): Locator {
    return this.previewVideo;
  }

  getThumbnailImage(): Locator {
    return this.thumbnailImage;
  }
}
