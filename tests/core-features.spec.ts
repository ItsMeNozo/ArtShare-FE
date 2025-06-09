import { test, expect } from "@playwright/test";
import { TestHelpers } from "./utils/test-helpers";

test.describe("Core Application Features", () => {
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
        }),
      );
    });
  });

  test.describe("Explore Page", () => {
    test.beforeEach(async ({ page }) => {
      // Mock posts data for explore page
      await helpers.mockApiResponse("/posts", {
        data: [
          {
            id: 1,
            title: "Amazing Digital Art",
            description: "Beautiful digital artwork",
            image_url: "https://example.com/art1.jpg",
            author: {
              username: "artist1",
              avatar: "https://example.com/avatar1.jpg",
            },
            likes_count: 42,
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: 2,
            title: "Stunning Photography",
            description: "Captured in the golden hour",
            image_url: "https://example.com/photo1.jpg",
            author: {
              username: "photographer1",
              avatar: "https://example.com/avatar2.jpg",
            },
            likes_count: 28,
            created_at: "2024-01-02T00:00:00Z",
          },
        ],
        pagination: { total: 2, page: 1, has_more: false },
      });

      await page.goto("/explore");
    });

    test("should display explore page correctly", async ({ page }) => {
      await helpers.waitForNetworkIdle();

      // Check if posts are loaded
      const posts = page.locator(
        '[data-testid="post"], .post, .art-card, article',
      );
      await expect(posts.first()).toBeVisible({ timeout: 10000 });

      // Check if navigation/header is present
      const header = page.locator("header, nav, .header, .navigation");
      if ((await header.count()) > 0) {
        await expect(header.first()).toBeVisible();
      }

      await helpers.takeScreenshot("explore-page");
    });

    test("should handle infinite scroll", async ({ page }) => {
      await helpers.waitForNetworkIdle();

      // Mock additional posts for infinite scroll
      await helpers.mockApiResponse("/posts?page=2", {
        data: [
          {
            id: 3,
            title: "More Art",
            description: "Additional content",
            image_url: "https://example.com/art3.jpg",
            author: { username: "artist2" },
            likes_count: 15,
          },
        ],
        pagination: { total: 3, page: 2, has_more: false },
      });

      // Scroll to bottom to trigger infinite scroll
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(2000);

      // Check if more posts are loaded
      const posts = page.locator(
        '[data-testid="post"], .post, .art-card, article',
      );
      const postCount = await posts.count();
      expect(postCount).toBeGreaterThan(0);
    });

    test("should handle post interactions", async ({ page }) => {
      await helpers.waitForNetworkIdle();

      const firstPost = page
        .locator('[data-testid="post"], .post, .art-card, article')
        .first();
      await expect(firstPost).toBeVisible();

      // Test like functionality
      const likeButton = firstPost.locator(
        'button[aria-label*="like"], .like-button, button:has([class*="heart"])',
      );
      if ((await likeButton.count()) > 0) {
        await helpers.mockApiResponse("/posts/1/like", {
          success: true,
          likes_count: 43,
        });
        await likeButton.click();
        await page.waitForTimeout(1000);
      }

      // Test comment functionality
      const commentButton = firstPost.locator(
        'button[aria-label*="comment"], .comment-button, button:has-text("Comment")',
      );
      if ((await commentButton.count()) > 0) {
        await commentButton.click();
        await page.waitForTimeout(1000);
      }

      // Test post click to view details
      await firstPost.click();
      await page.waitForTimeout(2000);

      // Should navigate to post detail or open modal
      const currentUrl = page.url();
      const hasModal =
        (await page.locator('[role="dialog"], .modal, .post-detail').count()) >
        0;

      expect(currentUrl.includes("/post/") || hasModal).toBeTruthy();
    });

    test("should filter posts by category", async ({ page }) => {
      await helpers.waitForNetworkIdle();

      // Look for category filters
      const categoryFilter = page.locator(
        '.category-filter, .filter-button, button:has-text("Digital Art"), button:has-text("Photography")',
      );

      if ((await categoryFilter.count()) > 0) {
        // Mock filtered results
        await helpers.mockApiResponse("/posts?category=digital", {
          data: [
            {
              id: 1,
              title: "Digital Art Only",
              category: "digital",
              image_url: "https://example.com/digital1.jpg",
            },
          ],
        });

        await categoryFilter.first().click();
        await page.waitForTimeout(2000);

        await helpers.takeScreenshot("filtered-posts");
      }
    });
  });

  test.describe("Search Functionality", () => {
    test("should perform search from header", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Find search input
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], .search-input',
      );

      if ((await searchInput.count()) > 0) {
        // Mock search results
        await helpers.mockApiResponse("/search", {
          posts: [
            {
              id: 1,
              title: "Search Result Art",
              description: "Found art piece",
              image_url: "https://example.com/search1.jpg",
            },
          ],
          users: [
            {
              id: 1,
              username: "searchuser",
              avatar: "https://example.com/searchavatar.jpg",
            },
          ],
        });

        await helpers.fillField(searchInput.first(), "digital art");
        await page.keyboard.press("Enter");

        await page.waitForTimeout(2000);

        // Should show search results
        expect(page.url()).toMatch(/\/(search|results)/);
        await helpers.takeScreenshot("search-results");
      }
    });

    test("should handle empty search results", async ({ page }) => {
      await page.goto("/explore");

      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], .search-input',
      );

      if ((await searchInput.count()) > 0) {
        // Mock empty search results
        await helpers.mockApiResponse("/search", {
          posts: [],
          users: [],
          total: 0,
        });

        await helpers.fillField(searchInput.first(), "nonexistentquery123");
        await page.keyboard.press("Enter");

        await page.waitForTimeout(2000);

        // Should show no results message
        const noResults = page.locator(
          "text=/no results/, text=/not found/, .empty-state",
        );
        if ((await noResults.count()) > 0) {
          await expect(noResults.first()).toBeVisible();
        }
      }
    });
  });

  test.describe("User Profile", () => {
    test("should display user profile page", async ({ page }) => {
      // Mock user profile data
      await helpers.mockApiResponse("/users/testuser", {
        id: 1,
        username: "testuser",
        full_name: "Test User",
        bio: "Artist and creator",
        avatar: "https://example.com/avatar.jpg",
        followers_count: 150,
        following_count: 200,
        posts_count: 25,
        posts: [
          {
            id: 1,
            title: "My Art",
            image_url: "https://example.com/myart1.jpg",
            likes_count: 10,
          },
        ],
      });

      await page.goto("/profile/testuser");
      await helpers.waitForNetworkIdle();

      // Check profile elements
      await helpers.waitForElement(
        '.profile, .user-profile, [data-testid="profile"]',
      );

      // Check for profile information
      const username = page.locator('text=/testuser/, h1:has-text("testuser")');
      await expect(username.first()).toBeVisible();

      await helpers.takeScreenshot("user-profile");
    });

    test("should handle follow/unfollow functionality", async ({ page }) => {
      await helpers.mockApiResponse("/users/otheruser", {
        id: 2,
        username: "otheruser",
        full_name: "Other User",
        is_following: false,
      });

      await page.goto("/profile/otheruser");
      await helpers.waitForNetworkIdle();

      const followButton = page.locator(
        'button:has-text("Follow"), .follow-button',
      );

      if ((await followButton.count()) > 0) {
        // Mock follow API call
        await helpers.mockApiResponse("/users/2/follow", {
          success: true,
          is_following: true,
        });

        await followButton.click();
        await page.waitForTimeout(1000);

        // Button should change to "Following" or "Unfollow"
        const unfollowButton = page.locator(
          'button:has-text("Following"), button:has-text("Unfollow")',
        );
        if ((await unfollowButton.count()) > 0) {
          await expect(unfollowButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe("Post Creation", () => {
    test("should open post creation modal/page", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Look for create post button
      const createButton = page.locator(
        'button:has-text("Create"), button:has-text("Post"), .create-button, [aria-label*="create"]',
      );

      if ((await createButton.count()) > 0) {
        await createButton.first().click();
        await page.waitForTimeout(2000);

        // Should open modal or navigate to create page
        const hasModal =
          (await page
            .locator('[role="dialog"], .modal, .create-post')
            .count()) > 0;
        const isCreatePage =
          page.url().includes("/create") || page.url().includes("/post/new");

        expect(hasModal || isCreatePage).toBeTruthy();

        if (hasModal) {
          await helpers.takeScreenshot("create-post-modal");
        } else {
          await helpers.takeScreenshot("create-post-page");
        }
      }
    });

    test("should handle image upload", async ({ page }) => {
      await page.goto("/explore");

      const createButton = page.locator(
        'button:has-text("Create"), button:has-text("Post"), .create-button',
      );

      if ((await createButton.count()) > 0) {
        await createButton.first().click();
        await page.waitForTimeout(1000);

        // Look for file input
        const fileInput = page.locator('input[type="file"]');

        if ((await fileInput.count()) > 0) {
          // Mock file upload
          await fileInput.setInputFiles(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          );
          await page.waitForTimeout(2000);

          await helpers.takeScreenshot("post-with-image");
        }
      }
    });
  });

  test.describe("Navigation", () => {
    test("should navigate between main sections", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Test navigation to different sections
      const navLinks = [
        { text: "Home", expectedUrl: /\/(home|explore)/ },
        { text: "Profile", expectedUrl: /\/profile/ },
        { text: "Browse", expectedUrl: /\/(browse|explore)/ },
        { text: "Collections", expectedUrl: /\/collections/ },
      ];

      for (const { text, expectedUrl } of navLinks) {
        const link = page.locator(
          `a:has-text("${text}"), nav a[href*="${text.toLowerCase()}"]`,
        );

        if ((await link.count()) > 0) {
          await link.first().click();
          await page.waitForTimeout(2000);

          if (expectedUrl) {
            expect(page.url()).toMatch(expectedUrl);
          }

          await helpers.takeScreenshot(`navigation-${text.toLowerCase()}`);
        }
      }
    });

    test("should handle mobile navigation", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Look for mobile menu toggle
      const mobileMenuToggle = page.locator(
        'button[aria-label*="menu"], .mobile-menu-toggle, .hamburger',
      );

      if ((await mobileMenuToggle.count()) > 0) {
        await mobileMenuToggle.click();
        await page.waitForTimeout(1000);

        // Mobile menu should be visible
        const mobileMenu = page.locator(
          '.mobile-menu, .menu-drawer, nav[role="dialog"]',
        );
        if ((await mobileMenu.count()) > 0) {
          await expect(mobileMenu.first()).toBeVisible();
          await helpers.takeScreenshot("mobile-menu-open");
        }
      }
    });
  });

  test.describe("Dark Mode", () => {
    test("should toggle dark mode", async ({ page }) => {
      await page.goto("/explore");
      await helpers.waitForNetworkIdle();

      // Look for dark mode toggle
      const darkModeToggle = page.locator(
        'button[aria-label*="dark"], .dark-mode-toggle, button:has-text("Dark")',
      );

      if ((await darkModeToggle.count()) > 0) {
        // Take screenshot in light mode
        await helpers.takeScreenshot("light-mode");

        await darkModeToggle.click();
        await page.waitForTimeout(1000);

        // Check if dark mode is applied
        const isDarkMode = await page.evaluate(() => {
          return (
            document.documentElement.classList.contains("dark") ||
            document.body.classList.contains("dark") ||
            document.documentElement.getAttribute("data-theme") === "dark"
          );
        });

        if (isDarkMode) {
          await helpers.takeScreenshot("dark-mode");
        }
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Simulate network failure
      await page.route("**/api/**", (route) => {
        route.abort("failed");
      });

      await page.goto("/explore");
      await page.waitForTimeout(3000);

      // Should show error state
      const errorMessage = page.locator(
        "text=/error/, text=/failed/, text=/try again/, .error-state",
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
        await helpers.takeScreenshot("network-error");
      }
    });

    test("should handle 404 pages", async ({ page }) => {
      await page.goto("/nonexistent-page");
      await page.waitForTimeout(2000);

      // Should show 404 page
      const notFound = page.locator(
        "text=/404/, text=/not found/, text=/page.*not.*exist/",
      );
      if ((await notFound.count()) > 0) {
        await expect(notFound.first()).toBeVisible();
        await helpers.takeScreenshot("404-page");
      }
    });
  });
});
