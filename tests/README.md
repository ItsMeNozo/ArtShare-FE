# ArtShare E2E Test Suite 🎨

A comprehensive end-to-end test suite for the ArtShare application using Playwright.

## 🧹 Test Data Cleanup System

This test suite includes an advanced cleanup system to ensure tests don't leave behind unwanted data.

### Quick Start with Cleanup

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('My Test Suite', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginWithTestUser();
  });

  test.afterEach(async () => {
    await helpers.cleanup(); // Automatically cleans up test data
  });

  test('should create a post', async ({ page }) => {
    // Create post and track it for cleanup
    const postId = await helpers.submitPostAndTrack();
    // Post will be automatically deleted after test
  });
});
```

### Available Cleanup Scripts

```bash
npm run test:cleanup          # Verify cleanup status
npm run test:cleanup:posts    # Clean up test posts
npm run test:cleanup:files    # Clean up test files
npm run test:cleanup:all      # Clean up everything
npm run test:integration      # Run integration tests with real data
```

### Environment Setup

Create `.env.test` file:

```bash
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!
VITE_BE_URL=http://localhost:3000
TEST_CLEANUP_ENABLED=true
```

See the full documentation in this file for advanced usage.

## 📋 Test Coverage

### 🔐 Authentication Tests (`auth.spec.ts`)

- **Landing Page**: Basic functionality and navigation
- **Login Flow**: Form validation, successful/failed login, social auth
- **Registration Flow**: Signup validation, email verification, error handling
- **OAuth Integration**: Google and Facebook authentication flows
- **Responsive Design**: Mobile and tablet authentication

### 🎯 Onboarding Tests (`onboarding.spec.ts`)

- **Profile Setup**: Form validation, required fields, age verification
- **User Experience**: Navigation flow, accessibility, keyboard support
- **Error Handling**: API errors, validation feedback
- **Responsive Design**: Mobile and tablet onboarding experience

### 🚀 Core Features Tests (`core-features.spec.ts`)

- **Explore Page**: Post loading, infinite scroll, filtering
- **Search Functionality**: Search results, empty states, filters
- **User Profiles**: Profile display, follow/unfollow functionality
- **Post Creation**: Upload functionality, form validation
- **Navigation**: Main app navigation, mobile menu
- **Dark Mode**: Theme switching functionality
- **Error Handling**: Network errors, 404 pages

### ⚡ Performance & Accessibility Tests (`performance-accessibility.spec.ts`)

- **Performance**: Load times, scroll performance, image optimization
- **Accessibility**: ARIA labels, keyboard navigation, screen readers
- **Browser Compatibility**: Cross-browser functionality
- **Mobile Responsiveness**: Touch interactions, viewport testing

### 🔥 Smoke Tests (`smoke-tests.spec.ts`)

- **Complete User Journeys**: End-to-end critical paths
- **Registration to First Use**: Full signup and onboarding flow
- **Login to Content Interaction**: Authentication to content engagement
- **Content Creation Journey**: Post creation and publishing
- **Search and Discovery**: Finding and exploring content
- **Social Interactions**: Following users, liking, commenting
- **Mobile User Experience**: Key mobile functionality
- **Error Recovery**: Graceful error handling and recovery

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Your ArtShare application running locally

### Install Dependencies

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### Environment Configuration

Create a `.env.test` file for test-specific environment variables:

```env
VITE_BE_URL=http://localhost:3000
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

## 🎮 Running Tests

### Run All Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

### Run Specific Test Suites

```bash
# Authentication tests only
npx playwright test auth.spec.ts

# Core features tests only
npx playwright test core-features.spec.ts

# Smoke tests only (critical journeys)
npx playwright test smoke-tests.spec.ts

# Performance and accessibility tests
npx playwright test performance-accessibility.spec.ts
```

### Run Tests on Specific Browsers

```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Mobile Chrome
npx playwright test --project=mobile-chrome

# All mobile devices
npx playwright test --project=mobile-chrome --project=mobile-safari
```

### Environment-Specific Testing

```bash
# Test against local development
TEST_ENV=local npx playwright test

# Test against production
TEST_ENV=production npx playwright test
```

## 📊 Test Reports

After running tests, Playwright generates several types of reports:

### HTML Report

```bash
# Open interactive HTML report
npx playwright show-report
```

### JSON Report

Test results are saved to `test-results/results.json` for CI/CD integration.

### Screenshots and Videos

- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/` (on failure)
- Traces: `test-results/traces/` (on retry)

## 🎯 Test Recording with Playwright

### Record New Tests

Use Playwright's codegen tool to record interactions:

```bash
# Record against local app
npx playwright codegen http://localhost:5173

# Record specific page
npx playwright codegen http://localhost:5173/login

# Record with device emulation
npx playwright codegen --device="iPhone 12" http://localhost:5173
```

### Recording Scenarios for Manual Testing

Based on the test scenarios I've created, here are key user flows to record manually:

#### 🔐 Authentication Scenarios

1. **Happy Path Login**:

   - Navigate to `/login`
   - Fill email and password
   - Submit form
   - Verify redirect to explore page

2. **Registration Flow**:

   - Navigate to `/signup`
   - Fill registration form
   - Handle email verification
   - Complete onboarding profile

3. **Social Login**:
   - Click Google/Facebook login
   - Handle OAuth popup
   - Verify successful login

#### 🎨 Content Interaction Scenarios

1. **Browse and Like Posts**:

   - Visit explore page
   - Scroll through posts
   - Like/unlike posts
   - View post details

2. **Search Functionality**:

   - Use search bar
   - Enter search terms
   - Browse search results
   - Filter by categories

3. **User Profile Interaction**:
   - Visit user profile
   - Follow/unfollow user
   - Browse user's posts
   - View follower/following lists

#### 📱 Mobile-Specific Scenarios

1. **Mobile Navigation**:

   - Open mobile menu
   - Navigate between sections
   - Test touch interactions

2. **Mobile Content Creation**:
   - Open create post on mobile
   - Upload image from mobile
   - Fill form and submit

## 🔧 Test Configuration

### Playwright Configuration

Key settings in `playwright.config.ts`:

- **Base URL**: Automatically points to your local dev server
- **Retries**: 2 retries on CI, 0 locally
- **Parallel Execution**: Full parallel execution for speed
- **Trace Collection**: On first retry for debugging
- **Screenshots**: Only on failure
- **Videos**: Retained on failure

### Custom Test Helpers

The `TestHelpers` class provides utilities for:

- Network request mocking
- Form filling with validation wait
- Authentication state management
- Screenshot capture
- Responsive testing

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📝 Test Data Management

### Mock Data

Tests use mock API responses to ensure consistent, fast execution. Mock data is defined in `test-helpers.ts`.

### Test Users

Predefined test users for different scenarios:

- Valid user with complete profile
- Invalid user for error testing
- Users for social interaction testing

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run specific test in debug mode
npx playwright test auth.spec.ts --debug

# Debug specific test case
npx playwright test -g "should login successfully" --debug
```

### Screenshots for Debugging

The test suite automatically captures screenshots at key points and on failures. Check `test-results/screenshots/` for visual debugging.

### Trace Viewer

```bash
# Open trace viewer for failed tests
npx playwright show-trace test-results/trace.zip
```

## 📋 Test Maintenance

### Adding New Tests

1. Identify the user journey or feature to test
2. Add test scenarios to appropriate spec file
3. Use `TestHelpers` for common operations
4. Mock API responses for consistent testing
5. Add responsive testing for mobile features

### Updating Selectors

If UI changes break tests:

1. Use `data-testid` attributes for stable selectors
2. Prefer semantic selectors (role, label) over CSS classes
3. Update selectors in `TestHelpers` for reusability

### Test Data Updates

Update mock data in `test-helpers.ts` when API responses change.

## 🎯 Best Practices

### Selector Strategy

1. **Preferred**: `data-testid` attributes
2. **Good**: Semantic selectors (`role`, `aria-label`)
3. **Acceptable**: Stable CSS classes
4. **Avoid**: Dynamic classes, complex CSS selectors

### Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names
- Include both happy path and error scenarios
- Test responsive behavior for key features

### Mock Strategy

- Mock external API calls for consistency
- Use realistic mock data
- Test error scenarios with mock failures
- Avoid mocking internal application logic

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns and structure
2. Add appropriate mock data
3. Include responsive testing for UI features
4. Update this README if adding new test categories
5. Ensure tests pass in all supported browsers

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Playwright Codegen](https://playwright.dev/docs/codegen)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🗑️ Detailed Test Data Cleanup Documentation

### System Overview

The test data cleanup system provides automatic cleanup of test data created during E2E tests, including:

- Posts created during tests
- Uploaded files (images, videos, etc.)
- Test users (when applicable)
- Browser storage and cookies

### Key Components

#### TestHelpers Class (`tests/utils/test-helpers.ts`)

- Main helper class for E2E tests
- Provides methods to track created test data
- Handles cleanup during test teardown

#### TestDataCleanup Class (`tests/utils/test-data-cleanup.ts`)

- Advanced cleanup utility with robust error handling
- Supports batch cleanup operations
- Provides cleanup verification

#### Environment Configuration (`.env.test`)

- Configure test environment settings
- Set API endpoints for cleanup
- Enable/disable cleanup features

### Test Types

#### Unit Tests (Mock Mode)

```typescript
test.beforeEach(async ({ page }) => {
  helpers = new TestHelpers(page);
  helpers.enableMockMode(); // Prevents real API calls
  await helpers.setupPostCreationMocks();
});
```

#### Integration Tests (Real Data)

```typescript
test.beforeEach(async ({ page }) => {
  helpers = new TestHelpers(page);
  helpers.disableMockMode(); // Allows real API calls (default)
  await helpers.loginWithTestUser();
});
```

### Manual Tracking

If you need to track data manually:

```typescript
test('manual tracking example', async ({ page }) => {
  // Create post via direct API call
  const postId = '123';
  helpers.trackCreatedPost(postId);

  // Upload file
  const fileUrl = 'https://example.com/uploads/test-image.jpg';
  helpers.trackUploadedFile(fileUrl);

  // Cleanup will handle these automatically
});
```

### Best Practices

#### 1. Always Use Unique Test Data

```typescript
const timestamp = new Date().getTime();
const title = `Test Post ${timestamp}`;
```

#### 2. Proper Error Handling

```typescript
test('should handle failures gracefully', async ({ page }) => {
  try {
    const postId = await helpers.submitPostAndTrack();
    // ... test logic ...
  } catch (error) {
    // Test failed, but cleanup will still happen in afterEach
    console.error('Test failed:', error);
    throw error;
  }
});
```

#### 3. Use Test Tags

```typescript
test('@integration @cleanup Real data test', async ({ page }) => {
  // This test creates real data and requires cleanup
});

test('@unit @mock Unit test', async ({ page }) => {
  helpers.enableMockMode();
  // This test uses mocks, no cleanup needed
});
```

### Environment Variables

```bash
# Test user credentials
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!

# Backend API URL
VITE_BE_URL=http://localhost:3000

# Cleanup settings
TEST_CLEANUP_ENABLED=true
TEST_VERBOSE_LOGGING=true
TEST_DATA_RETENTION_HOURS=24

# Database connection for direct cleanup (optional)
TEST_DB_URL=postgresql://testuser:testpass@localhost:5432/artshare_test

# File storage settings
TEST_STORAGE_PATH=/tmp/test-uploads
TEST_STORAGE_CLEANUP_ENABLED=true
```

### Troubleshooting

#### Cleanup Not Working?

1. Check if `TEST_CLEANUP_ENABLED=true` in `.env.test`
2. Verify your backend cleanup endpoints are working
3. Check console logs for cleanup errors
4. Run `npm run test:cleanup` to see remaining data

#### Authentication Issues?

```typescript
// Check if auth token is available
const authToken = await page.evaluate(() => {
  return localStorage.getItem('authToken');
});
console.log('Auth token:', authToken);
```

#### Files Not Being Deleted?

1. Check file permissions
2. Verify the cleanup endpoint URL
3. Check if files are actually uploaded to the expected location

### Advanced Features

#### Batch Cleanup

```typescript
// Clean up old test data (older than 24 hours)
await helpers.cleanupUtility.cleanupTestDataByAge(24);
```

#### Cleanup Verification

```typescript
// Verify cleanup was successful
const failed = await helpers.cleanupUtility.verifyCleanup(postIds, fileUrls);
if (failed.posts.length > 0) {
  console.warn('Failed to clean up posts:', failed.posts);
}
```

#### Custom Cleanup Logic

```typescript
class CustomTestHelpers extends TestHelpers {
  async customCleanup() {
    await super.cleanup();
    // Add your custom cleanup logic here
  }
}
```

### Performance Considerations

- Use mock mode for unit tests to avoid cleanup overhead
- Run cleanup verification only in CI environments
- Consider using a dedicated test database that can be easily reset
- Implement cleanup timeouts to prevent hanging tests

### Security Notes

- Never use production credentials in tests
- Use dedicated test accounts with limited permissions
- Consider using temporary/sandbox environments for integration tests
- Regularly audit test data to ensure cleanup is working

### Migration from Old Tests

If you have existing tests without cleanup:

1. Add `TestHelpers` to your test setup
2. Replace direct API calls with `helpers.submitPostAndTrack()`
3. Add `await helpers.cleanup()` in `afterEach`
4. Test the cleanup by running the verification script

This system ensures your E2E tests are clean, isolated, and don't interfere with each other or leave behind test data.
