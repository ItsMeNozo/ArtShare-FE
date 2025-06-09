import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Post Management Regression Tests", () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);

    // Mock authenticated and onboarded user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          email: "test@artshare.com",
          username: "testuser",
          is_onboard: true,
          full_name: "Test User",
        }),
      );
    });
  });

  test.describe("Post Upload Flow", () => {
    test("@smoke should upload image post with complete metadata", async ({
      page,
    }) => {
      await page.goto("/upload");
      await helpers.waitForElement('form, [data-testid="upload-form"]');

      // Mock file upload
      await helpers.mockApiResponse("/posts/upload", {
        success: true,
        post: {
          id: 1,
          title: "Test Artwork",
          description: "Beautiful digital art piece",
          image_url: "https://example.com/uploaded-image.jpg",
          tags: ["digital", "art", "creative"],
        },
      });

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "test-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("mock-image-data"),
      });

      // Fill metadata
      await helpers.fillField(
        'input[name="title"], input[placeholder*="title"]',
        "Test Artwork",
      );
      await helpers.fillField(
        'textarea[name="description"], textarea[placeholder*="description"]',
        "Beautiful digital art piece",
      );

      // Add tags
      const tagInput = page.locator(
        'input[name="tags"], input[placeholder*="tag"]',
      );
      if ((await tagInput.count()) > 0) {
        await tagInput.fill("digital");
        await page.keyboard.press("Enter");
        await tagInput.fill("art");
        await page.keyboard.press("Enter");
        await tagInput.fill("creative");
        await page.keyboard.press("Enter");
      }

      // Set visibility
      const publicRadio = page.locator(
        'input[value="public"], input[name="visibility"][value="public"]',
      );
      if ((await publicRadio.count()) > 0) {
        await publicRadio.check();
      }

      // Submit upload
      await helpers.clickAndWait(
        'button[type="submit"], button:has-text("Upload")',
        { waitForResponse: "/posts/upload" },
      );

      // Should redirect to post details or user profile
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/(posts|profile|dashboard)/);

      await helpers.takeScreenshot("post-upload-success");
    });

    test("should upload video post", async ({ page }) => {
      await page.goto("/upload");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse("/posts/upload", {
        success: true,
        post: {
          id: 2,
          title: "Test Video",
          description: "Creative video content",
          video_url: "https://example.com/uploaded-video.mp4",
          thumbnail_url: "https://example.com/video-thumbnail.jpg",
        },
      });

      // Upload video file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "test-video.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.from("mock-video-data"),
      });

      await helpers.fillField('input[name="title"]', "Test Video");
      await helpers.fillField(
        'textarea[name="description"]',
        "Creative video content",
      );

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/posts/upload",
      });

      await expect(page).toHaveURL(/(posts|profile|dashboard)/);
    });

    test("should handle upload with unsupported file type", async ({
      page,
    }) => {
      await page.goto("/upload");
      await helpers.waitForElement("form");

      // Try to upload unsupported file type
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "document.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("mock-pdf-data"),
      });

      // Should show error message
      await expect(page.locator("text=Unsupported file type")).toBeVisible();
    });

    test("should handle upload with file size too large", async ({ page }) => {
      await page.goto("/upload");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse(
        "/posts/upload",
        {
          success: false,
          error: "File size too large. Maximum allowed size is 10MB.",
        },
        400,
      );

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "large-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.alloc(15 * 1024 * 1024), // 15MB mock file
      });

      await helpers.fillField('input[name="title"]', "Large Image");
      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/posts/upload",
      });

      await expect(page.locator("text=File size too large")).toBeVisible();
    });

    test("should validate required fields before upload", async ({ page }) => {
      await page.goto("/upload");
      await helpers.waitForElement("form");

      // Try to submit without file or title
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator("text=Please select a file")).toBeVisible();
      await expect(page.locator("text=Title is required")).toBeVisible();
    });
  });

  test.describe("Post Editing", () => {
    test("should edit existing post metadata", async ({ page }) => {
      const postId = "123";

      // Mock existing post data
      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Original Title",
        description: "Original description",
        image_url: "https://example.com/original.jpg",
        tags: ["original", "tag"],
        visibility: "public",
        author: { id: 1, username: "testuser" },
      });

      await page.goto(`/posts/${postId}/edit`);
      await helpers.waitForElement("form");

      // Verify form is pre-filled
      await expect(page.locator('input[name="title"]')).toHaveValue(
        "Original Title",
      );
      await expect(page.locator('textarea[name="description"]')).toHaveValue(
        "Original description",
      );

      // Edit the fields
      await helpers.fillField('input[name="title"]', "Updated Title");
      await helpers.fillField(
        'textarea[name="description"]',
        "Updated description with more details",
      );

      // Mock update API
      await helpers.mockApiResponse(
        `/posts/${postId}`,
        {
          success: true,
          post: {
            id: parseInt(postId),
            title: "Updated Title",
            description: "Updated description with more details",
            image_url: "https://example.com/original.jpg",
          },
        },
        200,
        "PUT",
      );

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: `/posts/${postId}`,
      });

      // Should redirect to post details
      await expect(page).toHaveURL(`/posts/${postId}`);

      await helpers.takeScreenshot("post-edit-success");
    });

    test("should prevent editing post by non-owner", async ({ page }) => {
      const postId = "456";

      // Mock post owned by different user
      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Another User's Post",
        author: { id: 999, username: "otheruser" },
      });

      await page.goto(`/posts/${postId}/edit`);

      // Should show unauthorized message or redirect
      await expect(
        page.locator("text=You are not authorized to edit this post"),
      ).toBeVisible();
    });

    test("should change post visibility", async ({ page }) => {
      const postId = "789";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Visibility Test Post",
        description: "Testing visibility changes",
        visibility: "public",
        author: { id: 1, username: "testuser" },
      });

      await page.goto(`/posts/${postId}/edit`);
      await helpers.waitForElement("form");

      // Change to private
      const privateRadio = page.locator('input[value="private"]');
      await privateRadio.check();

      await helpers.mockApiResponse(
        `/posts/${postId}`,
        {
          success: true,
          post: { id: parseInt(postId), visibility: "private" },
        },
        200,
        "PUT",
      );

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: `/posts/${postId}`,
      });

      await expect(page).toHaveURL(`/posts/${postId}`);
    });
  });

  test.describe("Post Deletion", () => {
    test("should delete own post with confirmation", async ({ page }) => {
      const postId = "999";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Post to Delete",
        author: { id: 1, username: "testuser" },
      });

      await page.goto(`/posts/${postId}`);
      await helpers.waitForElement(
        '[data-testid="post-details"], .post-content',
      );

      // Click delete button
      const deleteButton = page.locator(
        'button:has-text("Delete"), [data-testid="delete-post"]',
      );
      await deleteButton.click();

      // Confirm deletion in modal
      await helpers.waitForElement('[role="dialog"], .modal');
      await expect(
        page.locator("text=Are you sure you want to delete this post?"),
      ).toBeVisible();

      await helpers.mockApiResponse(
        `/posts/${postId}`,
        {
          success: true,
          message: "Post deleted successfully",
        },
        200,
        "DELETE",
      );

      const confirmButton = page.locator(
        'button:has-text("Delete"), button:has-text("Confirm")',
      );
      await helpers.clickAndWait(confirmButton.last(), {
        waitForResponse: `/posts/${postId}`,
      });

      // Should redirect to profile or dashboard
      await expect(page).toHaveURL(/(profile|dashboard)/);
      await expect(
        page.locator("text=Post deleted successfully"),
      ).toBeVisible();
    });

    test("should cancel post deletion", async ({ page }) => {
      const postId = "888";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Post Not to Delete",
        author: { id: 1, username: "testuser" },
      });

      await page.goto(`/posts/${postId}`);

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      await helpers.waitForElement('[role="dialog"]');

      // Cancel deletion
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();

      // Should stay on post page
      await expect(page).toHaveURL(`/posts/${postId}`);
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe("Post Interactions", () => {
    test("@smoke should like and unlike a post", async ({ page }) => {
      const postId = "555";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Likeable Post",
        likes_count: 5,
        is_liked: false,
        author: { id: 2, username: "artist" },
      });

      await page.goto(`/posts/${postId}`);
      await helpers.waitForElement('[data-testid="post-details"]');

      // Like the post
      await helpers.mockApiResponse(
        `/posts/${postId}/like`,
        {
          success: true,
          likes_count: 6,
          is_liked: true,
        },
        200,
        "POST",
      );

      const likeButton = page.locator(
        '[data-testid="like-button"], button:has-text("Like")',
      );
      await helpers.clickAndWait(likeButton, {
        waitForResponse: `/posts/${postId}/like`,
      });

      // Verify like count updated
      await expect(page.locator("text=6")).toBeVisible();

      // Unlike the post
      await helpers.mockApiResponse(
        `/posts/${postId}/like`,
        {
          success: true,
          likes_count: 5,
          is_liked: false,
        },
        200,
        "DELETE",
      );

      await helpers.clickAndWait(likeButton, {
        waitForResponse: `/posts/${postId}/like`,
      });

      await expect(page.locator("text=5")).toBeVisible();
    });

    test("should add comment to post", async ({ page }) => {
      const postId = "666";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Commentable Post",
        comments_count: 2,
        author: { id: 2, username: "artist" },
      });

      await helpers.mockApiResponse(`/posts/${postId}/comments`, {
        data: [
          {
            id: 1,
            content: "Great work!",
            author: { username: "commenter1" },
            created_at: "2024-01-01T10:00:00Z",
          },
        ],
      });

      await page.goto(`/posts/${postId}`);
      await helpers.waitForElement('[data-testid="post-details"]');

      // Add new comment
      const commentInput = page.locator(
        'textarea[placeholder*="comment"], textarea[name="comment"]',
      );
      await commentInput.fill("This is amazing artwork!");

      await helpers.mockApiResponse(
        `/posts/${postId}/comments`,
        {
          success: true,
          comment: {
            id: 2,
            content: "This is amazing artwork!",
            author: { username: "testuser" },
            created_at: new Date().toISOString(),
          },
        },
        201,
        "POST",
      );

      const submitCommentButton = page.locator(
        'button:has-text("Comment"), button[type="submit"]',
      );
      await helpers.clickAndWait(submitCommentButton, {
        waitForResponse: `/posts/${postId}/comments`,
      });

      // Verify comment appears
      await expect(page.locator("text=This is amazing artwork!")).toBeVisible();
      await expect(page.locator("text=testuser")).toBeVisible();
    });

    test("should save post to collection", async ({ page }) => {
      const postId = "777";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Saveable Post",
        is_saved: false,
        author: { id: 2, username: "artist" },
      });

      await helpers.mockApiResponse("/collections", {
        data: [
          { id: 1, name: "Favorites", posts_count: 5 },
          { id: 2, name: "Inspiration", posts_count: 12 },
        ],
      });

      await page.goto(`/posts/${postId}`);
      await helpers.waitForElement('[data-testid="post-details"]');

      // Click save button
      const saveButton = page.locator(
        '[data-testid="save-button"], button:has-text("Save")',
      );
      await saveButton.click();

      // Select collection in modal
      await helpers.waitForElement('[role="dialog"]');
      await page.click("text=Favorites");

      await helpers.mockApiResponse(
        `/collections/1/posts`,
        {
          success: true,
          message: "Post saved to collection",
        },
        201,
        "POST",
      );

      const confirmSaveButton = page.locator(
        'button:has-text("Save to Collection")',
      );
      await helpers.clickAndWait(confirmSaveButton, {
        waitForResponse: "/collections/1/posts",
      });

      await expect(page.locator("text=Post saved to collection")).toBeVisible();
    });
  });

  test.describe("Post Sharing", () => {
    test("should share post via social media", async ({ page }) => {
      const postId = "111";

      await helpers.mockApiResponse(`/posts/${postId}`, {
        id: parseInt(postId),
        title: "Shareable Post",
        description: "Amazing artwork to share",
        image_url: "https://example.com/shareable.jpg",
        author: { username: "artist" },
      });

      await page.goto(`/posts/${postId}`);
      await helpers.waitForElement('[data-testid="post-details"]');

      // Click share button
      const shareButton = page.locator(
        '[data-testid="share-button"], button:has-text("Share")',
      );
      await shareButton.click();

      // Verify share options
      await helpers.waitForElement('[data-testid="share-menu"]');
      await expect(page.locator("text=Share on Twitter")).toBeVisible();
      await expect(page.locator("text=Share on Facebook")).toBeVisible();
      await expect(page.locator("text=Copy Link")).toBeVisible();
    });

    test("should copy post link to clipboard", async ({ page }) => {
      const postId = "222";

      await page.goto(`/posts/${postId}`);
      await helpers.waitForElement('[data-testid="post-details"]');

      const shareButton = page.locator('button:has-text("Share")');
      await shareButton.click();

      // Grant clipboard permissions
      await page.context().grantPermissions(["clipboard-write"]);

      const copyLinkButton = page.locator('button:has-text("Copy Link")');
      await copyLinkButton.click();

      // Verify clipboard contains post URL
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(clipboardText).toContain(`/posts/${postId}`);

      await expect(page.locator("text=Link copied to clipboard")).toBeVisible();
    });
  });
});
