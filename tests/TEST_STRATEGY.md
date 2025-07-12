# Test Strategy Documentation

## Test Categories

Our test suite is organized into three main categories based on cost and safety:

### 🤖 @ai - AI Tests (Manual Only)

- **Cost**: These tests use AI services and will incur charges
- **Environment**: Any environment
- **Execution**: Manual only - **NEVER run in CI/CD pipeline**
- **Command**: `npm run test:ai`
- **Purpose**: Tests that involve AI image generation, content analysis, or other AI-powered features

### ✅ @safe - Safe Tests (Production Pipeline)

- **Cost**: Free to run
- **Environment**: Production environment (read-only operations)
- **Execution**: Automated in CI/CD pipeline
- **Command**: `npm run test:safe`
- **Purpose**: Tests that verify UI functionality, navigation, and read-only operations

### ⚠️ @unsafe - Unsafe Tests (Preview Environment)

- **Cost**: Free to run
- **Environment**: Preview/test environment
- **Execution**: Automated in CI/CD pipeline
- **Command**: `npm run test:unsafe`
- **Purpose**: Tests that create, update, or delete data; require isolated test environment

## Available Commands

```bash
# Run all tests (not recommended for CI)
npm run test

# Run safe tests (production environment)
npm run test:safe

# Run unsafe tests (preview environment)
npm run test:unsafe

# Run AI tests (manual only - costs money!)
npm run test:ai

# Run smoke tests
npm run test:smoke

# Run tests with UI
npm run test:ui

# Clean up test data
npm run test:cleanup

# Show test report
npm run test:report
```

## CI/CD Pipeline

The GitHub Actions workflow will automatically run:

1. **@safe tests** against the production environment
2. **@unsafe tests** against the preview environment
3. **Test cleanup** to remove any test data

**@ai tests are excluded from the pipeline** to prevent unexpected charges.

## Test Tagging Examples

```typescript
// Safe test - can run in production
test('@safe should display landing page correctly', async ({ page }) => {
  // Read-only operations only
});

// Unsafe test - modifies data, needs test environment
test('@unsafe should create new user account', async ({ page }) => {
  // Creates/modifies data
});

// AI test - uses AI services, costs money
test('@ai should generate artwork with AI', async ({ page }) => {
  // Calls AI APIs that cost money
});
```

## Best Practices

1. **Always tag your tests** with one of the three categories
2. **Use @safe for read-only operations** that can safely run in production
3. **Use @unsafe for data-modifying operations** that need a test environment
4. **Use @ai sparingly** and only for features that absolutely require AI testing
5. **Keep AI tests focused** to minimize costs
6. **Test cleanup** should run after unsafe tests to maintain environment cleanliness
