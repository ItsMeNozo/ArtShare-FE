import { login } from '@/api/authentication/auth';
import api from '@/api/baseApi';
import { getUserProfile } from '@/features/user-profile-private/api/get-user-profile';
import { auth } from '@/firebase';
import { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';
import {
  AUTH_RETRY_DELAY_MS,
  AUTH_STATE_INITIALIZATION_DELAY_MS,
  BACKEND_TOKEN_PROCESSING_DELAY_MS,
  LOADING_DELAY_MS,
} from './constants';
import { AuthFlags } from './types';

export const handleFirebaseUserAuth = async (
  firebaseUser: FirebaseUser,
  flags: AuthFlags,
  setUser: (user: User | null) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
) => {
  console.log(
    '🔐 UserProvider: Firebase user detected, fetching backend token',
  );

  // If external login (Google/Facebook) is in progress, wait for it to complete
  if (flags.externalLoginInProgressRef.current) {
    console.log('🔐 UserProvider: External login in progress, waiting...');
    // Wait for external login to complete by polling the flag
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds max wait time
    while (flags.externalLoginInProgressRef.current && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }
    console.log('🔐 UserProvider: External login wait completed or timed out');

    // After external login completes, check if token was already set
    const tokenAfterExternalLogin = localStorage.getItem('accessToken');
    if (tokenAfterExternalLogin) {
      console.log(
        '🔐 UserProvider: External login already set token, using it',
      );
      api.defaults.headers.common['Authorization'] =
        `Bearer ${tokenAfterExternalLogin}`;

      try {
        const data = await getUserProfile();
        setUser(data);
        flags.authenticatedInSessionRef.current = true; // Mark as authenticated in this session
        console.log(
          '🔐 UserProvider: User profile set successfully from external login token:',
          data.username,
        );
        // Clear the external login flag after successful profile fetch
        flags.externalLoginInProgressRef.current = false;
        console.log(
          '🔐 UserProvider: External login flag cleared after successful profile fetch',
        );
        return; // Exit early since external login handled everything
      } catch (err) {
        console.error('🔐 UserProvider: Error with external login token:', err);
        // Clear the flag even on error to prevent hanging
        flags.externalLoginInProgressRef.current = false;
        console.log('🔐 UserProvider: External login flag cleared after error');
        // Continue with normal flow if external login token is invalid
      }
    } else {
      // No token was set by external login, clear the flag and continue with normal flow
      flags.externalLoginInProgressRef.current = false;
      console.log(
        '🔐 UserProvider: No token from external login, flag cleared, continuing with normal flow',
      );
    }
  }

  // If signup is in progress, wait for it to complete
  if (flags.signupInProgressRef.current) {
    console.log('🔐 UserProvider: Signup in progress, waiting...');
    // Wait for signup to complete by polling the flag
    let attempts = 0;
    const maxAttempts = 30; // 15 seconds max wait time
    while (flags.signupInProgressRef.current && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }
    console.log('🔐 UserProvider: Signup wait completed or timed out');
  }

  // Check if access token already exists (from external login or previous session)
  const existingToken = localStorage.getItem('accessToken');
  console.log(
    '🔐 UserProvider: Checking for existing token:',
    existingToken ? 'Found' : 'Not found',
  );

  // Check if user is already authenticated in this session and has valid token
  if (flags.authenticatedInSessionRef.current && existingToken) {
    console.log(
      '🔐 UserProvider: User already authenticated in this session with valid token, skipping token refresh',
    );
    console.log(
      '🔐 UserProvider: Session token (first 20 chars):',
      existingToken.substring(0, 20) + '...',
    );
    // Still validate the token periodically, but don't fetch a new one
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
      const data = await getUserProfile();
      setUser(data);
      console.log(
        '🔐 UserProvider: Session token still valid, user profile loaded',
      );
      return; // Exit early
    } catch (err) {
      console.log('🔐 UserProvider: Session token expired, will refresh:', err);
      flags.authenticatedInSessionRef.current = false; // Reset flag
    }
  }

  if (existingToken) {
    console.log(
      '🔐 UserProvider: Access token already exists, validating and fetching user profile',
    );
    console.log(
      '🔐 UserProvider: Existing token (first 20 chars):',
      existingToken.substring(0, 20) + '...',
    );

    try {
      // Set the authorization header for the existing token
      api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
      console.log(
        '🔐 UserProvider: Authorization header set for existing token',
      );

      // Add a small delay to ensure the backend has processed the token
      await new Promise((resolve) =>
        setTimeout(resolve, BACKEND_TOKEN_PROCESSING_DELAY_MS),
      );

      console.log(
        '🔐 UserProvider: Attempting to fetch user profile with existing token',
      );
      const data = await getUserProfile();
      setUser(data);
      console.log(
        '🔐 UserProvider: User profile set successfully from existing token:',
        data.username,
      );
      flags.authenticatedInSessionRef.current = true; // Mark as authenticated in this session
      console.log('🔐 UserProvider: Existing token is valid, stopping here');
      return; // Exit early since token already exists and is valid
    } catch (err) {
      console.error('🔐 UserProvider: Error with existing token:', err);

      // Only clear token if it's actually a 401/403 (authentication/authorization error)
      // Don't clear for network errors, 500 errors, etc.
      const isAuthError =
        (err instanceof Error &&
          (err.message.includes('401') ||
            err.message.includes('403') ||
            err.message.includes('not authenticated') ||
            err.message.includes('unauthorized'))) ||
        (err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'status' in err.response &&
          (err.response.status === 401 || err.response.status === 403));

      if (isAuthError) {
        console.log('🔐 UserProvider: Token is actually invalid, clearing it');
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
        // Continue to get new token since this one is definitely invalid
      } else {
        console.log(
          '🔐 UserProvider: Temporary error with existing token, keeping it for now',
        );
        // For temporary errors (network issues, 500 errors), don't fetch a new token
        // Just set the user to null and keep the existing token for future retries
        setUser(null);
        console.log(
          '🔐 UserProvider: Keeping existing token due to temporary error, stopping here',
        );
        return; // Don't continue to fetch new token for temporary errors
      }
    }
  } else {
    console.log('🔐 UserProvider: No existing token found, will fetch new one');
  }

  try {
    const fbToken = await firebaseUser.getIdToken(true); // Force refresh to get latest token

    // Try to login with retry logic for new users
    let loginResponse;
    let retryCount = 0;
    const maxRetries = 5; // Increased retries for new users

    while (retryCount < maxRetries) {
      try {
        loginResponse = await login(fbToken);
        break; // Success, exit retry loop
      } catch (loginError) {
        retryCount++;
        console.log(
          `🔐 UserProvider: Login attempt ${retryCount} failed:`,
          loginError,
        );

        // For new user scenarios, be more patient with 500 errors
        const isUserNotFoundError =
          loginError instanceof Error &&
          (loginError.message.includes('not found') ||
            loginError.message.includes('500'));

        if (retryCount >= maxRetries) {
          // If it's a user not found error after max retries, provide a helpful message
          if (isUserNotFoundError) {
            console.error(
              '🔐 UserProvider: User not found after max retries - this may be a new user sync issue',
            );
          }
          throw loginError; // Max retries reached, throw the error
        }

        // For user not found errors, wait longer before retrying
        const baseDelay = isUserNotFoundError ? 2000 : 1000;
        const delay = Math.min(baseDelay * Math.pow(1.5, retryCount - 1), 8000);
        console.log(`🔐 UserProvider: Retrying login in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (!loginResponse?.accessToken) {
      throw new Error('No access token received from backend');
    }

    console.log(
      '🔐 UserProvider: Received access token (first 20 chars):',
      loginResponse.accessToken.substring(0, 20) + '...',
    );

    // Always update localStorage and authorization header with the new token
    localStorage.setItem('accessToken', loginResponse.accessToken);
    api.defaults.headers.common['Authorization'] =
      `Bearer ${loginResponse.accessToken}`;
    console.log(
      '🔐 UserProvider: Access token stored and authorization header set',
    );

    console.log('🔐 UserProvider: Token set, waiting before fetching profile');

    // Add a small delay to ensure the backend has processed the token
    await new Promise((resolve) =>
      setTimeout(resolve, BACKEND_TOKEN_PROCESSING_DELAY_MS),
    );

    console.log('🔐 UserProvider: Fetching user profile');
    const data = await getUserProfile();
    setUser(data);
    flags.authenticatedInSessionRef.current = true; // Mark as authenticated in this session
    console.log(
      '🔐 UserProvider: User profile set successfully:',
      data.username,
    );
  } catch (err) {
    console.error('🔐 UserProvider: Error retrieving user token:', err);

    // If it's an authentication error, retry once after a short delay
    if (
      err instanceof Error &&
      (err.message.includes('not authenticated yet') ||
        err.message.includes('500') ||
        err.message.includes('not found'))
    ) {
      console.log('🔐 UserProvider: Auth not ready, retrying in 1000ms');
      setTimeout(async () => {
        try {
          const data = await getUserProfile();
          setUser(data);
          console.log('🔐 UserProvider: Retry successful');
        } catch (retryErr) {
          console.error('🔐 UserProvider: Retry failed:', retryErr);
          setError('Failed to retrieve user profile after retry.');
        } finally {
          // Always ensure loading is set to false after retry attempt
          setLoading(false);
        }
      }, AUTH_RETRY_DELAY_MS);
    } else {
      setError('Failed to retrieve user token.');
    }
  }
};

export const handleNoFirebaseUser = async (
  flags: AuthFlags,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void,
) => {
  console.log('🔐 UserProvider: No Firebase user detected');

  // Check if this is an explicit logout
  const isExplicitLogout = localStorage.getItem('explicitLogout') === 'true';
  if (isExplicitLogout) {
    console.log(
      '🔐 UserProvider: Explicit logout detected, clearing state immediately',
    );
    setUser(null);
    flags.authenticatedInSessionRef.current = false;
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
    return; // Skip the delayed logic for explicit logouts
  }

  // Don't immediately clear tokens on the first null event after page reload
  // Firebase takes time to restore auth state, so wait a bit before clearing
  if (!flags.authStateInitializedRef.current) {
    console.log(
      '🔐 UserProvider: Auth state not initialized yet, checking for existing token',
    );
    const existingToken = localStorage.getItem('accessToken');

    if (existingToken) {
      console.log(
        '🔐 UserProvider: Found existing token, attempting to validate before clearing',
      );
      try {
        // Try to validate the existing token before clearing it
        api.defaults.headers.common['Authorization'] =
          `Bearer ${existingToken}`;
        const data = await getUserProfile();
        setUser(data);
        console.log(
          '🔐 UserProvider: Existing token is still valid, keeping user logged in',
        );
        flags.authStateInitializedRef.current = true;
        setTimeout(() => {
          setLoading(false);
        }, LOADING_DELAY_MS);
        return; // Don't clear the token if it's still valid
      } catch (err) {
        console.log(
          '🔐 UserProvider: Existing token validation failed, will clear it:',
          err,
        );
        // Token is invalid, proceed to clear it
      }
    } else {
      // No existing token, but give Firebase more time to restore auth state
      console.log(
        '🔐 UserProvider: No existing token, waiting for Firebase auth state to initialize',
      );
      setTimeout(() => {
        // Check again after waiting for Firebase auth state
        if (!auth.currentUser && !localStorage.getItem('accessToken')) {
          console.log(
            '🔐 UserProvider: Firebase auth state still null after delay, confirming logout',
          );
          setUser(null);
          flags.authenticatedInSessionRef.current = false;
          delete api.defaults.headers.common['Authorization'];
          localStorage.removeItem('accessToken');
        }
        // Ensure loading is set to false after the delayed check
        setLoading(false);
      }, AUTH_STATE_INITIALIZATION_DELAY_MS);

      flags.authStateInitializedRef.current = true;
      console.log(
        '🔐 UserProvider: Auth state marked as initialized (no token case)',
      );
      // Don't set loading to false immediately, wait for the delayed check
      return; // Don't clear immediately, wait for the delayed check
    }

    // Mark auth state as initialized after the first check
    flags.authStateInitializedRef.current = true;
    console.log(
      '🔐 UserProvider: Auth state marked as initialized (token validation case)',
    );
  }

  console.log('🔐 UserProvider: Clearing user state and tokens');
  setUser(null);
  flags.authenticatedInSessionRef.current = false; // Reset authentication flag
  // Clear authorization header when user logs out
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('accessToken');
};
