# Test Strategy

## Test Categories

- **@safe**: Read-only tests, run against production.  
  _CI/CD: Yes_  
  _Command: `npm run test:production:ci`_

- **@unsafe**: Data-modifying tests, run against preview/test environment.  
  _CI/CD: Yes_  
  _Command: `npm run test:preview:ci`_

- **@ai**: AI-powered tests (may incur costs).  
  _CI/CD: No (manual only)_  
  _Command: `npm run test:ai`_

- **@cleanup**: Cleanup tests to remove test data.  
  _CI/CD: Yes (always runs after other tests)_  
  _Command: `npm run test:cleanup:ci`_

## Running Tests

```bash
# All local tests (not for CI)
npm run test

# Production-safe tests (CI/CD)
npm run test:production:ci

# Unsafe tests (CI/CD)
npm run test:preview:ci

# AI tests (manual only)
npm run test:ai

# Cleanup (CI/CD)
npm run test:cleanup:ci

# Show HTML report
npm run test:report
```

## CI/CD Pipeline

- Runs **@safe** tests on production
- Runs **@unsafe** tests on preview
- Runs **@cleanup** to remove test data
- **@ai** tests are excluded from CI/CD

## Tagging Examples

```typescript
// Safe test (production)
test('@safe should show landing page', async ({ page }) => {
  // Read-only
});

// Unsafe test (preview)
test('@unsafe should create user', async ({ page }) => {
  // Data-modifying
});

// AI test (manual only)
test('@ai should generate artwork', async ({ page }) => {
  // Calls paid AI APIs
});
```

## Best Practices

1. Tag every test with @safe, @unsafe, or @ai
2. Use @safe for read-only, @unsafe for data-modifying, @ai for AI/costly features
3. Keep AI tests minimal and focused
4. Cleanup always runs after unsafe tests
