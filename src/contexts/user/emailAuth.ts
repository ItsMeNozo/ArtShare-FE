import { login, signup } from '@/api/authentication/auth';
import { auth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const signUpWithEmail = async (
  email: string,
  password: string,
  setError: (error: string) => void,
): Promise<string> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    await signup(user.uid, email, '', '');
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    setError((error as Error).message);
    throw error;
  }
};

export const loginWithEmail = async (
  email: string,
  password: string,
  setError: (error: string) => void,
): Promise<string> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    if (!user?.emailVerified) {
      const errMsg = 'Please verify your email before logging in.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    // Don't call getUserProfile here - let onIdTokenChanged handle it
    const token = await user.getIdToken();
    const backendResponse = await login(token);
    if (backendResponse) {
      return token;
    } else {
      const errMsg = 'Error during login. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  } catch (error) {
    setError((error as Error).message);
    throw error;
  }
};

import { User } from '@/types';

export const logout = async (
  setLoading: (loading: boolean) => void,
  setUser: (user: User | null) => void,
  setError: (error: string | null) => void,
  authenticatedInSessionRef: React.MutableRefObject<boolean>,
): Promise<void> => {
  console.log('🔐 UserProvider: Starting logout...');

  try {
    // Clear user state immediately for instant UI feedback
    setUser(null);
    setError(null);
    authenticatedInSessionRef.current = false;

    // Clear authorization header and token immediately
    const api = (await import('@/api/baseApi')).default;
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');

    // Mark that we're in an explicit logout process
    localStorage.setItem('explicitLogout', 'true');

    // Sign out from Firebase
    await signOut(auth);

    console.log('🔐 UserProvider: Logout complete');
  } catch (error) {
    console.error('🔐 UserProvider: Logout error:', error);
    setError((error as Error).message);

    // Even if Firebase signout fails, we still want to clear local state
    setUser(null);
    setError(null);
    authenticatedInSessionRef.current = false;

    // Clear authorization header and token
    const api = (await import('@/api/baseApi')).default;
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  } finally {
    // Clean up the explicit logout flag after a short delay
    setTimeout(() => {
      localStorage.removeItem('explicitLogout');
    }, 1000);

    setLoading(false);
  }
};
