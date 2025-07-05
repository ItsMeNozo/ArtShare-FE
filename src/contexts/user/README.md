# User Authentication Module

This directory contains the refactored user authentication system that was previously in a single large `UserProvider.tsx` file.

## Structure

```
src/contexts/user/
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces and types
├── constants.ts          # Authentication constants and delays
├── UserContext.ts        # React context definition
├── UserProvider.tsx      # Main provider component
├── useUser.ts           # Custom hook for consuming context
├── emailAuth.ts         # Email/password authentication logic
├── socialAuth.ts        # Google/Facebook authentication logic
└── authHandler.ts       # Firebase auth state handling logic
```

## Usage

The refactored module maintains backward compatibility. You can still import as before:

```typescript
import { UserProvider, useUser } from '@/contexts/UserProvider';
```

Or use the new direct imports:

```typescript
import { UserProvider, useUser } from '@/contexts/user';
```

## Constants

All timing constants are centralized in `constants.ts`:

- `BACKEND_TOKEN_PROCESSING_DELAY_MS`: 100ms
- `AUTH_RETRY_DELAY_MS`: 1000ms
- `LOADING_DELAY_MS`: 300ms
- `AUTH_STATE_INITIALIZATION_DELAY_MS`: 1500ms
- `LOADING_TIMEOUT_MS`: 10000ms

## Migration Notes

The refactoring is fully backward compatible. No changes are required in consuming components. The original `UserProvider.tsx` has been moved to `UserProvider_OLD.tsx` as a backup.
