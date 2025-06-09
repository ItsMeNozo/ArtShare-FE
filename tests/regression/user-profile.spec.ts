import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("User Profile Management Regression Tests", () => {
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
          full_name: "Test User",
          bio: "Digital artist and creator",
          is_onboard: true,
          avatar: "https://example.com/avatar.jpg",
          followers_count: 150,
          following_count: 75,
          posts_count: 25,
        }),
      );
    });
  });

  test.describe("Profile Viewing", () => {
    test("@smoke should display own profile correctly", async ({ page }) => {
      await helpers.mockApiResponse("/profile/testuser", {
        id: 1,
        username: "testuser",
        full_name: "Test User",
        bio: "Digital artist and creator",
        avatar: "https://example.com/avatar.jpg",
        followers_count: 150,
        following_count: 75,
        posts_count: 25,
        is_following: false,
        is_own_profile: true,
      });

      await helpers.mockApiResponse("/users/testuser/posts", {
        data: [
          {
            id: 1,
            title: "Digital Landscape",
            image_url: "https://example.com/post1.jpg",
            likes_count: 42,
            comments_count: 8,
          },
          {
            id: 2,
            title: "Abstract Art",
            image_url: "https://example.com/post2.jpg",
            likes_count: 33,
            comments_count: 5,
          },
        ],
        pagination: { total: 2, page: 1, has_more: false },
      });

      await page.goto("/profile/testuser");
      await helpers.waitForElement(
        '[data-testid="profile-header"], .profile-container',
      );

      // Verify profile information
      await expect(page.locator("text=Test User")).toBeVisible();
      await expect(page.locator("text=@testuser")).toBeVisible();
      await expect(
        page.locator("text=Digital artist and creator"),
      ).toBeVisible();
      await expect(page.locator("text=150")).toBeVisible(); // followers
      await expect(page.locator("text=75")).toBeVisible(); // following
      await expect(page.locator("text=25")).toBeVisible(); // posts

      // Verify edit button is visible for own profile
      await expect(
        page.locator('button:has-text("Edit Profile"), a:has-text("Edit")'),
      ).toBeVisible();

      // Verify posts grid
      await expect(page.locator("text=Digital Landscape")).toBeVisible();
      await expect(page.locator("text=Abstract Art")).toBeVisible();

      await helpers.takeScreenshot("own-profile-view");
    });

    test("should display other user profile correctly", async ({ page }) => {
      await helpers.mockApiResponse("/profile/otheruser", {
        id: 2,
        username: "otheruser",
        full_name: "Other Artist",
        bio: "Professional photographer",
        avatar: "https://example.com/other-avatar.jpg",
        followers_count: 500,
        following_count: 200,
        posts_count: 120,
        is_following: false,
        is_own_profile: false,
      });

      await helpers.mockApiResponse("/users/otheruser/posts", {
        data: [
          {
            id: 3,
            title: "Street Photography",
            image_url: "https://example.com/street.jpg",
            likes_count: 89,
            comments_count: 15,
          },
        ],
      });

      await page.goto("/profile/otheruser");
      await helpers.waitForElement('[data-testid="profile-header"]');

      // Verify profile information
      await expect(page.locator("text=Other Artist")).toBeVisible();
      await expect(page.locator("text=@otheruser")).toBeVisible();
      await expect(
        page.locator("text=Professional photographer"),
      ).toBeVisible();

      // Verify follow button is visible (not edit button)
      await expect(page.locator('button:has-text("Follow")')).toBeVisible();
      await expect(
        page.locator('button:has-text("Edit Profile")'),
      ).not.toBeVisible();

      await helpers.takeScreenshot("other-profile-view");
    });

    test("should handle non-existent user profile", async ({ page }) => {
      await helpers.mockApiResponse(
        "/profile/nonexistent",
        {
          error: "User not found",
        },
        404,
      );

      await page.goto("/profile/nonexistent");

      await expect(page.locator("text=User not found")).toBeVisible();
      await expect(
        page.locator("text=The user you are looking for does not exist"),
      ).toBeVisible();
    });
  });

  test.describe("Profile Editing", () => {
    test("should edit profile information successfully", async ({ page }) => {
      await helpers.mockApiResponse("/profile/testuser", {
        id: 1,
        username: "testuser",
        full_name: "Test User",
        bio: "Digital artist and creator",
        avatar: "https://example.com/avatar.jpg",
        email: "test@artshare.com",
        is_own_profile: true,
      });

      await page.goto("/profile/edit");
      await helpers.waitForElement('form, [data-testid="edit-profile-form"]');

      // Verify form is pre-filled
      await expect(page.locator('input[name="full_name"]')).toHaveValue(
        "Test User",
      );
      await expect(page.locator('textarea[name="bio"]')).toHaveValue(
        "Digital artist and creator",
      );

      // Edit profile information
      await helpers.fillField('input[name="full_name"]', "Test User Updated");
      await helpers.fillField(
        'textarea[name="bio"]',
        "Updated bio: Digital artist, photographer, and UI designer",
      );

      // Mock successful update
      await helpers.mockApiResponse(
        "/profile",
        {
          success: true,
          user: {
            id: 1,
            username: "testuser",
            full_name: "Test User Updated",
            bio: "Updated bio: Digital artist, photographer, and UI designer",
            avatar: "https://example.com/avatar.jpg",
          },
        },
        200,
        "PUT",
      );

      await helpers.clickAndWait(
        'button[type="submit"], button:has-text("Save")',
        { waitForResponse: "/profile" },
      );

      // Should redirect to profile page with updated info
      await expect(page).toHaveURL(/\/profile\/testuser/);
      await expect(
        page.locator("text=Profile updated successfully"),
      ).toBeVisible();

      await helpers.takeScreenshot("profile-edit-success");
    });

    test("should upload and change profile avatar", async ({ page }) => {
      await page.goto("/profile/edit");
      await helpers.waitForElement("form");

      // Mock avatar upload
      await helpers.mockApiResponse(
        "/profile/avatar",
        {
          success: true,
          avatar_url: "https://example.com/new-avatar.jpg",
        },
        200,
        "POST",
      );

      // Upload new avatar
      const avatarInput = page.locator('input[type="file"][accept*="image"]');
      await avatarInput.setInputFiles({
        name: "new-avatar.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("mock-avatar-data"),
      });

      // Verify preview appears
      await helpers.waitForElement('img[src*="new-avatar"], .avatar-preview');

      await helpers.clickAndWait(
        'button:has-text("Save"), button[type="submit"]',
        { waitForResponse: "/profile/avatar" },
      );

      await expect(
        page.locator("text=Avatar updated successfully"),
      ).toBeVisible();
    });

    test("should validate profile form fields", async ({ page }) => {
      await page.goto("/profile/edit");
      await helpers.waitForElement("form");

      // Clear required fields
      await helpers.fillField('input[name="full_name"]', "");

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator("text=Full name is required")).toBeVisible();
    });

    test("should handle bio character limit", async ({ page }) => {
      await page.goto("/profile/edit");
      await helpers.waitForElement("form");

      // Fill bio with text exceeding limit (assuming 500 chars)
      const longBio = "A".repeat(501);
      await helpers.fillField('textarea[name="bio"]', longBio);

      // Should show character count warning
      await expect(page.locator("text=Character limit exceeded")).toBeVisible();

      // Submit button should be disabled
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test("should change username with availability check", async ({ page }) => {
      await page.goto("/profile/edit");
      await helpers.waitForElement("form");

      // Mock username availability check
      await helpers.mockApiResponse("/users/check-username", {
        available: true,
      });

      const usernameField = page.locator('input[name="username"]');
      if ((await usernameField.count()) > 0) {
        await helpers.fillField('input[name="username"]', "newusername");

        // Wait for availability check
        await page.waitForTimeout(1000);
        await expect(page.locator("text=Username is available")).toBeVisible();

        // Mock successful username update
        await helpers.mockApiResponse(
          "/profile",
          {
            success: true,
            user: { username: "newusername" },
          },
          200,
          "PUT",
        );

        await helpers.clickAndWait('button[type="submit"]', {
          waitForResponse: "/profile",
        });

        // Should redirect to new profile URL
        await expect(page).toHaveURL(/\/profile\/newusername/);
      }
    });

    test("should handle unavailable username", async ({ page }) => {
      await page.goto("/profile/edit");
      await helpers.waitForElement("form");

      await helpers.mockApiResponse("/users/check-username", {
        available: false,
        message: "Username is already taken",
      });

      const usernameField = page.locator('input[name="username"]');
      if ((await usernameField.count()) > 0) {
        await helpers.fillField('input[name="username"]', "existinguser");

        await page.waitForTimeout(1000);
        await expect(
          page.locator("text=Username is already taken"),
        ).toBeVisible();

        // Submit button should be disabled
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeDisabled();
      }
    });
  });

  test.describe("Social Features", () => {
    test("should follow another user", async ({ page }) => {
      await helpers.mockApiResponse("/profile/artist", {
        id: 2,
        username: "artist",
        full_name: "Amazing Artist",
        followers_count: 1000,
        is_following: false,
        is_own_profile: false,
      });

      await page.goto("/profile/artist");
      await helpers.waitForElement('[data-testid="profile-header"]');

      // Mock follow API
      await helpers.mockApiResponse(
        "/users/2/follow",
        {
          success: true,
          is_following: true,
          followers_count: 1001,
        },
        200,
        "POST",
      );

      const followButton = page.locator('button:has-text("Follow")');
      await helpers.clickAndWait(followButton, {
        waitForResponse: "/users/2/follow",
      });

      // Button should change to "Following"
      await expect(page.locator('button:has-text("Following")')).toBeVisible();

      // Follower count should increase
      await expect(page.locator("text=1001")).toBeVisible();
    });

    test("should unfollow a user", async ({ page }) => {
      await helpers.mockApiResponse("/profile/artist", {
        id: 2,
        username: "artist",
        full_name: "Amazing Artist",
        followers_count: 1001,
        is_following: true,
        is_own_profile: false,
      });

      await page.goto("/profile/artist");
      await helpers.waitForElement('[data-testid="profile-header"]');

      // Mock unfollow API
      await helpers.mockApiResponse(
        "/users/2/follow",
        {
          success: true,
          is_following: false,
          followers_count: 1000,
        },
        200,
        "DELETE",
      );

      const followingButton = page.locator('button:has-text("Following")');
      await followingButton.click();

      // Confirm unfollow in modal if it appears
      const confirmButton = page.locator('button:has-text("Unfollow")');
      if ((await confirmButton.count()) > 0) {
        await helpers.clickAndWait(confirmButton, {
          waitForResponse: "/users/2/follow",
        });
      }

      // Button should change back to "Follow"
      await expect(page.locator('button:has-text("Follow")')).toBeVisible();
      await expect(page.locator("text=1000")).toBeVisible();
    });

    test("should view followers list", async ({ page }) => {
      await helpers.mockApiResponse("/users/testuser/followers", {
        data: [
          {
            id: 2,
            username: "follower1",
            full_name: "First Follower",
            avatar: "https://example.com/follower1.jpg",
            is_following_back: true,
          },
          {
            id: 3,
            username: "follower2",
            full_name: "Second Follower",
            avatar: "https://example.com/follower2.jpg",
            is_following_back: false,
          },
        ],
        pagination: { total: 2, has_more: false },
      });

      await page.goto("/profile/testuser");
      await helpers.waitForElement('[data-testid="profile-header"]');

      // Click followers count
      const followersLink = page.locator("text=150").first();
      await helpers.clickAndWait(followersLink, {
        waitForResponse: "/users/testuser/followers",
      });

      // Should open followers modal or navigate to followers page
      await helpers.waitForElement(
        '[data-testid="followers-list"], .followers-modal',
      );

      // Verify followers are displayed
      await expect(page.locator("text=First Follower")).toBeVisible();
      await expect(page.locator("text=@follower1")).toBeVisible();
      await expect(page.locator("text=Second Follower")).toBeVisible();
      await expect(page.locator("text=@follower2")).toBeVisible();
    });

    test("should view following list", async ({ page }) => {
      await helpers.mockApiResponse("/users/testuser/following", {
        data: [
          {
            id: 4,
            username: "following1",
            full_name: "First Following",
            avatar: "https://example.com/following1.jpg",
          },
        ],
        pagination: { total: 1, has_more: false },
      });

      await page.goto("/profile/testuser");
      await helpers.waitForElement('[data-testid="profile-header"]');

      // Click following count
      const followingLink = page.locator("text=75").first();
      await helpers.clickAndWait(followingLink, {
        waitForResponse: "/users/testuser/following",
      });

      await helpers.waitForElement('[data-testid="following-list"]');
      await expect(page.locator("text=First Following")).toBeVisible();
    });
  });

  test.describe("Profile Privacy & Settings", () => {
    test("should make profile private", async ({ page }) => {
      await page.goto("/profile/edit");
      await helpers.waitForElement("form");

      // Toggle privacy setting
      const privateToggle = page.locator(
        'input[type="checkbox"][name="is_private"], input[name="privacy"]',
      );
      if ((await privateToggle.count()) > 0) {
        await privateToggle.check();

        await helpers.mockApiResponse(
          "/profile",
          {
            success: true,
            user: { is_private: true },
          },
          200,
          "PUT",
        );

        await helpers.clickAndWait('button[type="submit"]', {
          waitForResponse: "/profile",
        });

        await expect(
          page.locator("text=Profile privacy updated"),
        ).toBeVisible();
      }
    });

    test("should block another user", async ({ page }) => {
      await page.goto("/profile/baduser");
      await helpers.waitForElement('[data-testid="profile-header"]');

      // Click user menu/options
      const userMenu = page.locator(
        '[data-testid="user-menu"], button:has-text("⋯")',
      );
      await userMenu.click();

      // Click block option
      const blockButton = page.locator('button:has-text("Block User")');
      await blockButton.click();

      // Confirm in modal
      await helpers.waitForElement('[role="dialog"]');
      await expect(
        page.locator("text=Are you sure you want to block this user?"),
      ).toBeVisible();

      await helpers.mockApiResponse(
        "/users/block",
        {
          success: true,
          message: "User blocked successfully",
        },
        200,
        "POST",
      );

      const confirmBlockButton = page.locator('button:has-text("Block")');
      await helpers.clickAndWait(confirmBlockButton, {
        waitForResponse: "/users/block",
      });

      await expect(
        page.locator("text=User blocked successfully"),
      ).toBeVisible();

      // Should redirect away from blocked user's profile
      await expect(page).not.toHaveURL(/\/profile\/baduser/);
    });

    test("should report inappropriate profile", async ({ page }) => {
      await page.goto("/profile/reportuser");
      await helpers.waitForElement('[data-testid="profile-header"]');

      const userMenu = page.locator('[data-testid="user-menu"]');
      await userMenu.click();

      const reportButton = page.locator('button:has-text("Report User")');
      await reportButton.click();

      // Fill report form
      await helpers.waitForElement('[data-testid="report-form"]');

      const reasonSelect = page.locator('select[name="reason"]');
      await reasonSelect.selectOption("inappropriate_content");

      await helpers.fillField(
        'textarea[name="details"]',
        "This profile contains inappropriate content",
      );

      await helpers.mockApiResponse(
        "/reports",
        {
          success: true,
          message: "Report submitted successfully",
        },
        201,
        "POST",
      );

      await helpers.clickAndWait('button:has-text("Submit Report")', {
        waitForResponse: "/reports",
      });

      await expect(
        page.locator("text=Report submitted successfully"),
      ).toBeVisible();
    });
  });
});
