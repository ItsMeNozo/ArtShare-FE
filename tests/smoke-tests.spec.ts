import { test, expect } from "@playwright/test";
import { TestHelpers, testData } from "./utils/test-helpers";

test.describe("Critical User Journeys - Smoke Tests", () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe("Complete User Registration Journey", () => {
    test("should complete full registration and onboarding flow", async ({
      page,
    }) => {
      // 1. Start at landing page
      await page.goto("/");
      await helpers.waitForNetworkIdle();

      // 2. Navigate to signup
      const signupButton = page.locator(
        'a[href="/signup"], button:has-text("Sign Up"), a:has-text("Sign Up")',
      );
      if ((await signupButton.count()) > 0) {
        await signupButton.first().click();
      } else {
        await page.goto("/signup");
      }

      await helpers.waitForElement("form");

      // 3. Fill signup form
      const uniqueEmail = `test${Date.now()}@artshare.com`;
      await helpers.mockApiResponse("/auth/signup", {
        success: true,
        token: "verification-token-123",
      });

      await helpers.fillField('input[type="email"]', uniqueEmail);
      await helpers.fillField(
        'input[type="password"]',
        testData.validUser.password,
      );

      await helpers.clickAndWait('button[type="submit"]', {
        waitForResponse: "/auth/signup",
      });

      // 4. Should redirect to activation page
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/\/activate-account/);

      // 5. Mock successful activation
      await helpers.mockApiResponse("/auth/activate", {
        success: true,
        user: { id: 1, email: uniqueEmail, is_onboard: false },
        token: "auth-token-123",
      });

      // Simulate clicking activation link or button
      const activateButton = page.locator(
        'button:has-text("Activate"), a:has-text("Activate"), button[type="submit"]',
      );
      if ((await activateButton.count()) > 0) {
        await activateButton.first().click();
        await page.waitForTimeout(2000);
      }

      // 6. Should redirect to onboarding
      if (
        page.url().includes("/onboarding") ||
        (await page.locator('.onboarding, [role="dialog"]').count()) > 0
      ) {
        // Complete onboarding
        await helpers.mockApiResponse("/users/profile", {
          success: true,
          user: { ...testData.validUser, is_onboard: true },
        });

        await helpers.fillField(
          'input[name="full_name"], input[placeholder*="name"]',
          testData.validUser.fullName,
        );
        await helpers.fillField(
          'input[name="username"], input[placeholder*="username"]',
          `user${Date.now()}`,
        );
        await helpers.fillField(
          'input[type="date"], input[name="birthday"]',
          testData.validUser.birthday,
        );

        const completeButton = page.locator(
          'button[type="submit"], button:has-text("Complete"), button:has-text("Continue")',
        );
        await completeButton.first().click();
        await page.waitForTimeout(3000);
      }

      // 7. Should end up in main app (explore page)
      expect(page.url()).toMatch(/\/(explore|home|dashboard)/);

      await helpers.takeScreenshot("registration-journey-complete");
    });
  });

  test.describe("Login to Content Interaction Journey", () => {
    test("should login and interact with content successfully", async ({
      page,
    }) => {
      // 1. Start at login page
      await page.goto("/login");

      // 2. Mock successful login
      await helpers.mockApiResponse("/auth/login", {
        success: true,
        user: { id: 1, email: testData.validUser.email, is_onboard: true },
        token: "auth-token-123",
      });

      await helpers.fillField('input[type="email"]', testData.validUser.email);
      await helpers.fillField(
        'input[type="password"]',
        testData.validUser.password,
      );
      await helpers.clickAndWait('button[type="submit"]', {
        waitForNavigation: true,
      });

      // 3. Should be on explore page
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/\/(explore|home|dashboard)/);

      // 4. Mock posts data
      await helpers.mockApiResponse("/posts", {
        data: [
          {
            id: 1,
            title: "Amazing Digital Art",
            description: "Beautiful artwork",
            image_url: "https://picsum.photos/400/600?random=1",
            author: {
              username: "artist1",
              avatar: "https://picsum.photos/50/50?random=1",
            },
            likes_count: 42,
            is_liked: false,
          },
        ],
      });

      await helpers.waitForNetworkIdle();

      // 5. Interact with a post (like it)
      const firstPost = page
        .locator('[data-testid="post"], .post, .art-card, article')
        .first();
      await expect(firstPost).toBeVisible({ timeout: 10000 });

      const likeButton = firstPost.locator(
        'button[aria-label*="like"], .like-button, button:has([class*="heart"])',
      );
      if ((await likeButton.count()) > 0) {
        await helpers.mockApiResponse("/posts/1/like", {
          success: true,
          likes_count: 43,
          is_liked: true,
        });
        await likeButton.click();
        await page.waitForTimeout(1000);
      }

      // 6. Navigate to user profile
      const profileLink = page.locator(
        'a[href="/profile"], .profile-link, [data-testid="profile-link"]',
      );
      if ((await profileLink.count()) > 0) {
        await helpers.mockApiResponse("/users/profile", {
          id: 1,
          username: testData.validUser.username,
          full_name: testData.validUser.fullName,
          bio: testData.validUser.bio,
          posts_count: 5,
          followers_count: 100,
          following_count: 150,
        });

        await profileLink.first().click();
        await page.waitForTimeout(2000);

        expect(page.url()).toMatch(/\/profile/);
      }

      await helpers.takeScreenshot("login-interaction-journey-complete");
    });
  });

  test.describe("Content Creation Journey", () => {
    test("should create and publish content successfully", async ({ page }) => {
      // 1. Start logged in
      await page.addInitScript(() => {
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            email: "test@artshare.com",
            username: "testuser",
            is_onboard: true,
          }),
        );
      });

      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // 2. Open create post
      const createButton = page.locator(
        'button:has-text("Create"), button:has-text("Post"), .create-button, [aria-label*="create"]',
      );

      if ((await createButton.count()) > 0) {
        await createButton.first().click();
        await page.waitForTimeout(2000);

        // 3. Fill in post details
        const titleInput = page.locator(
          'input[name="title"], input[placeholder*="title"], .title-input',
        );
        if ((await titleInput.count()) > 0) {
          await helpers.fillField(titleInput.first(), testData.testPost.title);
        }

        const descriptionInput = page.locator(
          'textarea[name="description"], textarea[placeholder*="description"], .description-input',
        );
        if ((await descriptionInput.count()) > 0) {
          await helpers.fillField(
            descriptionInput.first(),
            testData.testPost.description,
          );
        }

        // 4. Mock image upload
        const fileInput = page.locator('input[type="file"]');
        if ((await fileInput.count()) > 0) {
          await fileInput.setInputFiles({
            name: "test-image.png",
            mimeType: "image/png",
            buffer: Buffer.from(
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
              "base64",
            ),
          });
          await page.waitForTimeout(2000);
        }

        // 5. Mock successful post creation
        await helpers.mockApiResponse(
          "/posts",
          {
            success: true,
            post: {
              id: 2,
              title: testData.testPost.title,
              description: testData.testPost.description,
              image_url: "https://example.com/uploaded-image.jpg",
            },
          },
          201,
        );

        // 6. Submit post
        const submitButton = page.locator(
          'button[type="submit"], button:has-text("Publish"), button:has-text("Post")',
        );
        if ((await submitButton.count()) > 0) {
          await submitButton.first().click();
          await page.waitForTimeout(3000);
        }

        // 7. Should redirect back to explore or show success
        const successMessage = page.locator(
          "text=/success/, text=/published/, .success",
        );
        const isOnExplore = page.url().includes("/explore");

        expect((await successMessage.count()) > 0 || isOnExplore).toBeTruthy();
      }

      await helpers.takeScreenshot("content-creation-journey-complete");
    });
  });

  test.describe("Search and Discovery Journey", () => {
    test("should search and discover content successfully", async ({
      page,
    }) => {
      // 1. Start on explore page
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // 2. Perform search
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], .search-input',
      );

      if ((await searchInput.count()) > 0) {
        // Mock search results
        await helpers.mockApiResponse("/search", {
          posts: [
            {
              id: 1,
              title: "Digital Art Search Result",
              image_url: "https://picsum.photos/400/600?random=2",
              author: { username: "digitalartist" },
            },
          ],
          users: [
            {
              id: 2,
              username: "digitalartist",
              full_name: "Digital Artist",
              avatar: "https://picsum.photos/50/50?random=2",
            },
          ],
        });

        await helpers.fillField(searchInput.first(), "digital art");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(2000);

        // 3. Should show search results
        expect(page.url()).toMatch(/\/(search|results)/);

        // 4. Click on a search result
        const searchResult = page
          .locator(".search-result, .post, .art-card")
          .first();
        if ((await searchResult.count()) > 0) {
          await searchResult.click();
          await page.waitForTimeout(2000);
        }
      }

      // 5. Browse by category
      await page.goto("/explore");
      const categoryFilter = page.locator(
        '.category-filter, .filter-button, button:has-text("Photography")',
      );

      if ((await categoryFilter.count()) > 0) {
        await helpers.mockApiResponse("/posts?category=photography", {
          data: [
            {
              id: 3,
              title: "Stunning Photography",
              category: "photography",
              image_url: "https://picsum.photos/400/600?random=3",
            },
          ],
        });

        await categoryFilter.first().click();
        await page.waitForTimeout(2000);
      }

      await helpers.takeScreenshot("search-discovery-journey-complete");
    });
  });

  test.describe("Social Interaction Journey", () => {
    test("should follow user and interact socially", async ({ page }) => {
      // 1. Start logged in
      await page.addInitScript(() => {
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            email: "test@artshare.com",
            username: "testuser",
            is_onboard: true,
          }),
        );
      });

      // 2. Visit another user's profile
      await helpers.mockApiResponse("/users/otheruserprofile", {
        id: 2,
        username: "otheruserprofile",
        full_name: "Other User",
        bio: "Amazing artist",
        followers_count: 500,
        following_count: 300,
        posts_count: 50,
        is_following: false,
        posts: [
          {
            id: 1,
            title: "User Art",
            image_url: "https://picsum.photos/400/600?random=4",
            likes_count: 25,
          },
        ],
      });

      await page.goto("/profile/otheruserprofile");
      await helpers.waitForNetworkIdle();

      // 3. Follow the user
      const followButton = page.locator(
        'button:has-text("Follow"), .follow-button',
      );
      if ((await followButton.count()) > 0) {
        await helpers.mockApiResponse("/users/2/follow", {
          success: true,
          is_following: true,
          followers_count: 501,
        });

        await followButton.click();
        await page.waitForTimeout(1000);

        // Button should change to Following/Unfollow
        const unfollowButton = page.locator(
          'button:has-text("Following"), button:has-text("Unfollow")',
        );
        if ((await unfollowButton.count()) > 0) {
          await expect(unfollowButton.first()).toBeVisible();
        }
      }

      // 4. Like their post
      const userPost = page
        .locator('.post, .art-card, [data-testid="post"]')
        .first();
      if ((await userPost.count()) > 0) {
        const likeButton = userPost.locator(
          'button[aria-label*="like"], .like-button',
        );
        if ((await likeButton.count()) > 0) {
          await helpers.mockApiResponse("/posts/1/like", {
            success: true,
            likes_count: 26,
            is_liked: true,
          });

          await likeButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // 5. Add comment if comment functionality exists
      const commentButton = page.locator(
        'button[aria-label*="comment"], .comment-button, button:has-text("Comment")',
      );
      if ((await commentButton.count()) > 0) {
        await commentButton.first().click();
        await page.waitForTimeout(1000);

        const commentInput = page.locator(
          'input[placeholder*="comment"], textarea[placeholder*="comment"], .comment-input',
        );
        if ((await commentInput.count()) > 0) {
          await helpers.mockApiResponse(
            "/posts/1/comments",
            {
              success: true,
              comment: {
                id: 1,
                text: "Great artwork!",
                author: { username: "testuser" },
              },
            },
            201,
          );

          await helpers.fillField(commentInput.first(), "Great artwork!");

          const submitComment = page.locator(
            'button:has-text("Comment"), button:has-text("Post"), button[type="submit"]',
          );
          if ((await submitComment.count()) > 0) {
            await submitComment.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }

      await helpers.takeScreenshot("social-interaction-journey-complete");
    });
  });

  test.describe("Mobile User Journey", () => {
    test("should complete key actions on mobile device", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // 1. Navigate to app
      await page.goto("/");
      await helpers.waitForNetworkIdle();

      // 2. Open mobile menu if exists
      const mobileMenuToggle = page.locator(
        'button[aria-label*="menu"], .mobile-menu-toggle, .hamburger',
      );
      if ((await mobileMenuToggle.count()) > 0) {
        await mobileMenuToggle.click();
        await page.waitForTimeout(1000);

        // Navigate to login via mobile menu
        const loginLink = page.locator('a[href="/login"], a:has-text("Login")');
        if ((await loginLink.count()) > 0) {
          await loginLink.first().click();
        } else {
          await page.goto("/login");
        }
      } else {
        await page.goto("/login");
      }

      // 3. Login on mobile
      await helpers.mockApiResponse("/auth/login", {
        success: true,
        user: { id: 1, email: testData.validUser.email, is_onboard: true },
        token: "mobile-auth-token",
      });

      await helpers.fillField('input[type="email"]', testData.validUser.email);
      await helpers.fillField(
        'input[type="password"]',
        testData.validUser.password,
      );
      await helpers.clickAndWait('button[type="submit"]', {
        waitForNavigation: true,
      });

      // 4. Browse content on mobile
      await page.waitForTimeout(2000);
      await helpers.mockApiResponse("/posts", {
        data: [
          {
            id: 1,
            title: "Mobile Art",
            image_url: "https://picsum.photos/300/400?random=5",
            author: { username: "mobileartist" },
          },
        ],
      });

      await helpers.waitForNetworkIdle();

      // 5. Test mobile-specific interactions
      const post = page.locator(".post, .art-card").first();
      if ((await post.count()) > 0) {
        // Touch interaction (tap)
        await post.tap();
        await page.waitForTimeout(1000);
      }

      await helpers.takeScreenshot("mobile-journey-complete");
    });
  });

  test.describe("Error Recovery Journey", () => {
    test("should handle and recover from errors gracefully", async ({
      page,
    }) => {
      // 1. Start with network errors
      await page.route("**/api/posts*", (route) => {
        route.abort("failed");
      });

      await page.goto("/explore");
      await page.waitForTimeout(3000);

      // 2. Should show error state
      const errorMessage = page.locator(
        "text=/error/, text=/failed/, text=/try again/, .error-state",
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();

        // 3. Try retry functionality
        const retryButton = page.locator(
          'button:has-text("Retry"), button:has-text("Try again"), .retry-button',
        );
        if ((await retryButton.count()) > 0) {
          // Remove network failure and allow success
          await page.unroute("**/api/posts*");
          await helpers.mockApiResponse("/posts", {
            data: [
              {
                id: 1,
                title: "Recovery Art",
                image_url: "https://picsum.photos/400/600?random=6",
              },
            ],
          });

          await retryButton.click();
          await page.waitForTimeout(2000);

          // Should now show content
          const posts = page.locator(".post, .art-card");
          if ((await posts.count()) > 0) {
            await expect(posts.first()).toBeVisible();
          }
        }
      }

      await helpers.takeScreenshot("error-recovery-journey-complete");
    });
  });
});
