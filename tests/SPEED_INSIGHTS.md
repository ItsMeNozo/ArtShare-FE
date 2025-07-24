# Speed Insights Test Suite

This test suite is designed to automatically navigate to all public routes of the ArtShare app in production, triggering Vercel Speed Insights for each page. It is intended to be run after each deployment to production.

## How it works

- Uses Playwright to visit each public route.
- Waits for the page to finish loading (including any loading spinner).
- Does not require authentication.

## How to run

### Locally

```
npm run test:speed-insights
```

### In CI

This test is already integrated into the GitHub Actions pipeline and will run automatically after deployment to production.

## Adding/Editing Routes

- Edit `tests/e2e/speed-insights.spec.ts` to add or remove routes as your app changes.

## Notes

- Only public routes should be included (no authentication required).
- The test waits for a loading spinner with `data-testid="loading"` to disappear. Adjust this selector if your loading component changes.
- This test is for analytics and monitoring, not for functional correctness.
