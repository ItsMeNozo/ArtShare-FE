import { login, signup } from '@/api/authentication/auth';
import api from '@/api/baseApi';
import { auth } from '@/firebase';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

export const authenWithGoogle = async (
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  externalLoginInProgressRef: React.MutableRefObject<boolean>,
  signupInProgressRef: React.MutableRefObject<boolean>,
): Promise<void> => {
  try {
    setLoading(true);
    setError(null); // Clear any previous errors
    externalLoginInProgressRef.current = true; // Set flag to prevent race condition
    console.log('🔐 Starting Google authentication');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // Configure popup to reduce COOP issues
    const result = await signInWithPopup(auth, provider);
    const { user: googleUser } = result;
    const token = await googleUser.getIdToken();

    console.log('🔐 Google auth successful, attempting login');

    // Try to login first (like Facebook auth does)
    try {
      const backendResponse = await login(token);
      if (backendResponse.success) {
        console.log('🔐 Google login successful');
        // Store the access token immediately for Google login
        if (backendResponse.access_token) {
          localStorage.setItem('accessToken', backendResponse.access_token);
          api.defaults.headers.common['Authorization'] =
            `Bearer ${backendResponse.access_token}`;
          console.log(
            '🔐 Google login: Token stored in localStorage and auth header set',
          );
        }

        // Don't clear the flag yet - let onIdTokenChanged handle user profile fetching
        // The flag will be cleared after onIdTokenChanged finishes
        return; // Let onIdTokenChanged handle the rest
      }
    } catch (loginError) {
      console.log('🔐 Google login failed, attempting signup:', loginError);
    }

    // If login fails, try to signup (user doesn't exist in backend)
    console.log('🔐 Creating new Google user in backend');
    signupInProgressRef.current = true; // Set flag to prevent race condition
    try {
      const signupResponse = await signup(
        googleUser.uid,
        googleUser.email!,
        '',
        googleUser.displayName || '',
      );
      if (signupResponse.success) {
        console.log('🔐 Google signup successful');
        // Add a small delay to ensure backend user creation is fully propagated
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw new Error('Failed to create account in backend');
      }
    } catch (signupError) {
      console.error('🔐 Backend signup failed:', signupError);
      // If signup fails, sign out from Firebase to prevent inconsistent state
      await signOut(auth);
      throw new Error('Failed to create account. Please try again.');
    } finally {
      // Clear flag after a slight delay to ensure onIdTokenChanged can see it and wait
      setTimeout(() => {
        signupInProgressRef.current = false;
        externalLoginInProgressRef.current = false;
        console.log('🔐 Signup and external login flags cleared');
      }, 500);
    }

    // Let onIdTokenChanged handle the login flow
    console.log(
      '🔐 Google authentication complete, letting onIdTokenChanged handle login',
    );
  } catch (error) {
    console.error('🔐 Google sign-in error:', error);
    setLoading(false);

    // Clear signup flag immediately on error
    signupInProgressRef.current = false;
    externalLoginInProgressRef.current = false;

    // Handle specific popup errors
    if (error instanceof Error) {
      if (
        error.message.includes('popup-closed-by-user') ||
        error.message.includes('popup-blocked')
      ) {
        throw new Error('Login was cancelled or blocked. Please try again.');
      }
      if (error.message.includes('network-request-failed')) {
        throw new Error(
          'Network error. Please check your connection and try again.',
        );
      }
    }

    setError((error as Error).message);
    throw error;
  }
};

export const signUpWithFacebook = async (
  setError: (error: string) => void,
  externalLoginInProgressRef: React.MutableRefObject<boolean>,
) => {
  const provider = new FacebookAuthProvider();
  try {
    externalLoginInProgressRef.current = true; // Set flag to prevent race condition
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    const token = await user.getIdToken();

    const backendResponse = await login(token);
    if (backendResponse.success) {
      // Store the access token immediately for Facebook login
      if (backendResponse.access_token) {
        localStorage.setItem('accessToken', backendResponse.access_token);
        api.defaults.headers.common['Authorization'] =
          `Bearer ${backendResponse.access_token}`;
      }
      // Clear the flag after successful login
      externalLoginInProgressRef.current = false;
      // Let onIdTokenChanged handle user profile fetching
      return;
    } else {
      const signupResponse = await signup(
        user.uid,
        user.email!,
        '',
        user.displayName || '',
      );
      if (signupResponse.success) {
        // Clear the flag after successful signup
        externalLoginInProgressRef.current = false;
        // Let onIdTokenChanged handle the login flow after signup
        return;
      } else {
        setError('Error with Facebook login.');
      }
    }
  } catch (error) {
    externalLoginInProgressRef.current = false; // Clear flag on error
    setError((error as Error).message);
  }
};
