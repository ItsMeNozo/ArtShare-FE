# GitHub Actions Setup for E2E Tests

This guide explains how to configure GitHub Actions secrets and environment variables for E2E tests and test data cleanup.

## Required GitHub Actions Secrets

Add these secrets in your repository settings (**Settings → Secrets and variables → Actions**):

- `TEST_USER_EMAIL`: Test user email (e.g., `testuser@example.com`)
- `TEST_USER_PASSWORD`: Test user password
- `VITE_BE_URL`: Backend URL for tests

## Local Development

Create a `.env.test` file (not committed to git):

```
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!
VITE_BE_URL=http://localhost:3000
TEST_CLEANUP_ENABLED=true
TEST_VERBOSE_LOGGING=true
```

## Troubleshooting

- Ensure secret names match exactly (case-sensitive)
- Confirm secrets are set at the repository level
- Make sure backend and test accounts are accessible from CI
- Add debug steps if needed:

```yaml
- run: printenv | grep TEST_
```

---

This setup ensures your E2E tests run reliably in CI/CD while maintaining proper cleanup of test data.
