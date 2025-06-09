# ArtShare E2E Test Suite 🎨

A comprehensive end-to-end test suite for the ArtShare application using Playwright.

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
TEST_USER_EMAIL=test@artshare.com
TEST_USER_PASSWORD=TestPassword123!
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

# Test against staging
TEST_ENV=staging npx playwright test

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
