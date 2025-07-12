# GitHub Actions Setup for E2E Tests

This document explains how to configure GitHub Actions secrets for your E2E tests with test data cleanup.

## Required GitHub Actions Secrets

Navigate to your repository settings and add these secrets:

### 1. Go to Repository Settings

- Go to your GitHub repository
- Click on "Settings" tab
- Click on "Secrets and variables" → "Actions"
- Click "New repository secret"

### 2. Add Required Secrets

#### `TEST_USER_EMAIL`

- **Name**: `TEST_USER_EMAIL`
- **Value**: Your test user email (e.g., `testuser@example.com`)
- **Description**: Email for dedicated test account

#### `TEST_USER_PASSWORD`

- **Name**: `TEST_USER_PASSWORD`
- **Value**: Your test user password (e.g., `TestPassword123!`)
- **Description**: Password for dedicated test account

#### `TEST_BE_URL`

- **Name**: `TEST_BE_URL`
- **Value**: Your backend API URL (e.g., `https://api.artshare.com` or `http://localhost:3000`)
- **Description**: Backend API URL for test environment ONLY (not production)

#### `TEST_DB_USER`

- **Name**: `TEST_DB_USER`
- **Value**: Test database username (e.g., `testuser`)
- **Description**: Username for test database connection

#### `TEST_DB_PASSWORD`

- **Name**: `TEST_DB_PASSWORD`
- **Value**: Test database password
- **Description**: Password for test database connection

#### `TEST_DB_HOST`

- **Name**: `TEST_DB_HOST`
- **Value**: Test database host (e.g., `localhost` or `test-db.example.com`)
- **Description**: Host for test database connection

#### `TEST_DB_PORT`

- **Name**: `TEST_DB_PORT`
- **Value**: Test database port (e.g., `5432`)
- **Description**: Port for test database connection

#### `TEST_DB_NAME`

- **Name**: `TEST_DB_NAME`
- **Value**: Test database name (e.g., `artshare_test`)
- **Description**: Name of test database

#### `TEST_DB_URI`

- **Name**: `TEST_DB_URI`
- **Value**: Complete database connection string
- **Description**: Full URI for test database connection

#### `TEST_FIREBASE_API_KEY`

- **Name**: `TEST_FIREBASE_API_KEY`
- **Value**: Firebase API key for test project
- **Description**: Firebase API key for test environment only

#### `TEST_FIREBASE_AUTH_DOMAIN`

- **Name**: `TEST_FIREBASE_AUTH_DOMAIN`
- **Value**: Firebase Auth domain for test project
- **Description**: Firebase authentication domain for test environment

#### `TEST_FIREBASE_PROJECT_ID`

- **Name**: `TEST_FIREBASE_PROJECT_ID`
- **Value**: Firebase project ID for test project
- **Description**: Firebase project ID for test environment

#### `TEST_FIREBASE_STORAGE_BUCKET`

- **Name**: `TEST_FIREBASE_STORAGE_BUCKET`
- **Value**: Firebase storage bucket for test project
- **Description**: Firebase storage bucket for test environment

#### `TEST_FIREBASE_MESSAGING_SENDER_ID`

- **Name**: `TEST_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: Firebase messaging sender ID for test project
- **Description**: Firebase messaging sender ID for test environment

#### `TEST_FIREBASE_APP_ID`

- **Name**: `TEST_FIREBASE_APP_ID`
- **Value**: Firebase app ID for test project
- **Description**: Firebase app ID for test environment

#### `TEST_FIREBASE_MEASUREMENT_ID`

- **Name**: `TEST_FIREBASE_MEASUREMENT_ID`
- **Value**: Firebase measurement ID for test project
- **Description**: Firebase measurement ID for test environment (optional)

## Optional Secrets

### `TEST_DB_URL` (for direct database cleanup)

- **Name**: `TEST_DB_URL`
- **Value**: Database connection string for test database
- **Description**: Direct database access for advanced cleanup

### `TEST_STORAGE_ACCESS_KEY` (for file storage cleanup)

- **Name**: `TEST_STORAGE_ACCESS_KEY`
- **Value**: Storage access key for cleaning up uploaded files
- **Description**: Access key for cloud storage cleanup

## Environment Variables in Workflow

The workflow now includes these environment variables:

```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  TEST_BE_URL: ${{ secrets.TEST_BE_URL }}
  TEST_CLEANUP_ENABLED: true
  TEST_VERBOSE_LOGGING: true
  TEST_ENVIRONMENT: ci
  TEST_DB_USER: ${{ secrets.TEST_DB_USER }}
  TEST_DB_PASSWORD: ${{ secrets.TEST_DB_PASSWORD }}
  TEST_DB_HOST: ${{ secrets.TEST_DB_HOST }}
  TEST_DB_PORT: ${{ secrets.TEST_DB_PORT }}
  TEST_DB_NAME: ${{ secrets.TEST_DB_NAME }}
  TEST_DB_URI: ${{ secrets.TEST_DB_URI }}
  # Firebase Test Environment
  VITE_FIREBASE_API_KEY: ${{ secrets.TEST_FIREBASE_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.TEST_FIREBASE_AUTH_DOMAIN }}
  VITE_FIREBASE_PROJECT_ID: ${{ secrets.TEST_FIREBASE_PROJECT_ID }}
  VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.TEST_FIREBASE_STORAGE_BUCKET }}
  VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.TEST_FIREBASE_MESSAGING_SENDER_ID }}
  VITE_FIREBASE_APP_ID: ${{ secrets.TEST_FIREBASE_APP_ID }}
  VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.TEST_FIREBASE_MEASUREMENT_ID }}
```

## Security Best Practices

### 1. Use Dedicated Test Accounts

- Create separate test accounts, not production accounts
- Give test accounts minimal required permissions
- Use different credentials for different environments

### 2. Test Environment Isolation

- Use a separate test database
- Use a separate file storage bucket/folder
- Use test-specific API endpoints when possible

### 3. Secret Management

- Never commit secrets to code
- Use repository secrets for sensitive data
- Use environment variables for non-sensitive config

## Workflow Features

### 1. Test Execution

```yaml
- name: Acceptance Tests
  run: npm run test:e2e
  env:
    # Environment variables are injected here
```

### 2. Automatic Cleanup Verification

```yaml
- name: Verify Test Data Cleanup
  run: npm run test:cleanup
  if: always() # Runs even if tests fail
```

### 3. Artifact Upload

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

## Local Development

For local development, you can use `.env.test`:

```bash
# .env.test (not committed to git)
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_BE_URL=http://localhost:3000
TEST_CLEANUP_ENABLED=true
TEST_VERBOSE_LOGGING=true
TEST_DB_USER=testuser
TEST_DB_PASSWORD=testpassword
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=artshare_test
TEST_DB_URI=postgresql://testuser:testpassword@localhost:5432/artshare_test
# Firebase Test Environment
VITE_FIREBASE_API_KEY=AIzaSyAbYUGCp4EO-UqtNC1TAR1VaniFlFkCN7I
VITE_FIREBASE_AUTH_DOMAIN=artshare-test.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=artshare-test
VITE_FIREBASE_STORAGE_BUCKET=artshare-test.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=358409662794
VITE_FIREBASE_APP_ID=1:358409662794:web:6ec473aecbfca86c6991b3
VITE_FIREBASE_MEASUREMENT_ID=G-XLMNHFM65R
```

## Troubleshooting

### Secrets Not Working?

1. Check secret names match exactly (case-sensitive)
2. Verify secrets are set at repository level, not organization level
3. Check if secrets are available in the workflow run logs (they'll show as `***`)

### Tests Failing in CI?

1. Check if your backend is accessible from GitHub Actions
2. Verify test user accounts exist in your test environment
3. Check if cleanup endpoints are accessible

### Environment Differences?

1. Add debugging to see what environment variables are set:

```yaml
- name: Debug Environment
  run: |
    echo "TEST_USER_EMAIL is set: ${{ secrets.TEST_USER_EMAIL != '' }}"
    echo "TEST_BE_URL is set: ${{ secrets.TEST_BE_URL != '' }}"
    echo "TEST_DB_USER is set: ${{ secrets.TEST_DB_USER != '' }}"
```

## Example Complete Workflow

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Start Backend (if needed)
        run: |
          # Start your backend service if needed
          # npm run start:backend &
          # sleep 10

      - name: Acceptance Tests
        run: npm run test:e2e
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          VITE_BE_URL: ${{ secrets.VITE_BE_URL }}
          TEST_CLEANUP_ENABLED: true
          TEST_VERBOSE_LOGGING: true
          TEST_ENVIRONMENT: ci

      - name: Verify Test Data Cleanup
        run: npm run test:cleanup
        if: always()
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          VITE_BE_URL: ${{ secrets.VITE_BE_URL }}

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Next Steps

1. **Set up GitHub Actions secrets** with your test credentials
2. **Test the workflow** by pushing a commit
3. **Monitor the cleanup** to ensure no test data is left behind
4. **Adjust timeout** if needed based on your test suite size

This setup ensures your E2E tests run reliably in CI/CD while maintaining proper cleanup of test data.
