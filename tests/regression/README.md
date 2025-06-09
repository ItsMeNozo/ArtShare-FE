# ArtShare Regression Test Suite

This directory contains comprehensive end-to-end regression tests for the ArtShare application using Playwright.

## Test Structure

### Test Files

- **`auth-workflows.spec.ts`** - Complete authentication flows including signup, login, password reset, and session management
- **`post-management.spec.ts`** - Post upload, editing, deletion, and user interactions (like, comment, save, share)
- **`user-profile.spec.ts`** - User profile management, social features, and privacy settings

### Test Categories

All tests focus on **success scenarios only** and cover the following areas:

#### Authentication (`auth-workflows.spec.ts`)

- ✅ Complete user registration with email verification
- ✅ Login with various user states (verified, onboarded, etc.)
- ✅ Password reset flow
- ✅ Session management and token handling
- ✅ Social authentication (Google, Facebook)

#### Post Management (`post-management.spec.ts`)

- ✅ Image and video upload with metadata
- ✅ Post editing and visibility settings
- ✅ Post deletion with confirmation
- ✅ Post interactions (like, comment, save)
- ✅ Post sharing functionality

#### User Profile (`user-profile.spec.ts`)

- ✅ Profile viewing and editing
- ✅ Avatar and cover photo upload
- ✅ Social features (follow/unfollow)
- ✅ Privacy settings and account management
- ✅ Collections and saved posts

## Smoke Tests

Critical user journeys are tagged with `@smoke` for quick validation:

- User registration and onboarding
- Login and authentication
- Image upload and posting
- Profile viewing and basic interactions

## Running Tests

### All Tests

```bash
npm run test
```

### Smoke Tests Only

```bash
npm run test:smoke
```

### Regression Tests Only

```bash
npm run test:regression
```

### Interactive Mode

```bash
npm run test:ui
```

### View Reports

```bash
npm run test:report
```

## Test Helpers

The `TestHelpers` class in `../utils/test-helpers.ts` provides:

- **API Mocking** - Mock backend responses for consistent testing
- **Authentication** - Helper methods for login/logout flows
- **Form Interactions** - Simplified form filling and validation
- **Network Management** - Wait for requests and responses
- **Visual Regression** - Screenshot capture for UI validation
- **Responsive Testing** - Test across different viewport sizes

## Test Data

Predefined test data is available in `testData` export:

```typescript
import { testData } from "../utils/test-helpers";

// Use predefined user data
await helpers.fillField('input[name="email"]', testData.validUser.email);
```

## Best Practices

1. **Mock API Responses** - All tests use mocked API responses for consistency
2. **Focus on Success Paths** - Tests validate successful user journeys
3. **Visual Regression** - Screenshots are captured for UI validation
4. **Responsive Design** - Critical flows are tested across viewports
5. **Clean State** - Each test starts with a clean authentication state

## Configuration

Tests are configured via `playwright.config.ts` with:

- Multiple browser support (Chromium, Firefox, Safari)
- Responsive testing viewports
- Screenshot and video capture on failure
- Parallel execution for faster runs
- Custom timeout settings for network operations

## Maintenance

When adding new features:

1. Add success-focused test scenarios
2. Use existing `TestHelpers` methods
3. Add `@smoke` tags to critical paths
4. Update this README with new test coverage
5. Ensure tests are deterministic and reliable
