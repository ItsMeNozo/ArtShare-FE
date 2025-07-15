# ArtShare E2E Test Suite 🎨

A comprehensive end-to-end test suite for the ArtShare application using Playwright.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.test.example` to `.env.test` and fill in required values.
3. **Run tests:**
   ```bash
   npm run test           # Run all tests locally
   npm run test:report    # Show HTML report
   ```

For more commands, see the scripts in `package.json`.

## Test Data Cleanup

This suite includes an advanced cleanup system to ensure tests don't leave behind unwanted data. See `TestHelpers` usage in your test files and available cleanup scripts in `package.json`.

## Documentation

- **Test strategy, tagging, and CI/CD details:** See [`TEST_STRATEGY.md`](./TEST_STRATEGY.md)
- **Advanced usage, helpers, and troubleshooting:** See comments and docs in the test files and helpers.

---

For any questions or contributions, please refer to the guidelines in `TEST_STRATEGY.md` and the code comments.
