import { auth } from '@/firebase';
import { User } from '@/types';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { UserContext } from './UserContext';
import { handleFirebaseUserAuth, handleNoFirebaseUser } from './authHandler';
import { LOADING_DELAY_MS, LOADING_TIMEOUT_MS } from './constants';
import {
  loginWithEmail as loginWithEmailAuth,
  logout as logoutAuth,
  signUpWithEmail as signUpWithEmailAuth,
} from './emailAuth';
import {
  authenWithGoogle as authenWithGoogleAuth,
  signUpWithFacebook as signUpWithFacebookAuth,
} from './socialAuth';
import { AuthFlags } from './types';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [logoutInProgress, setLogoutInProgress] = useState<boolean>(false);

  // Create auth flags as individual refs
  const signupInProgressRef = useRef<boolean>(false);
  const externalLoginInProgressRef = useRef<boolean>(false);
  const authStateInitializedRef = useRef<boolean>(false);
  const authenticatedInSessionRef = useRef<boolean>(false);

  useEffect(() => {
    console.log('🔐 UserProvider: Setting up auth listener');

    // Add a safety timeout to prevent infinite loading
    const loadingTimeoutId = setTimeout(() => {
      console.log(
        '🔐 UserProvider: Loading timeout reached, forcing loading to false',
      );
      setLoading(false);
    }, LOADING_TIMEOUT_MS);

    // Create flags object
    const flags: AuthFlags = {
      signupInProgressRef,
      externalLoginInProgressRef,
      authStateInitializedRef,
      authenticatedInSessionRef,
    };

    const unsubscribe = auth.onIdTokenChanged(
      async (firebaseUser) => {
        // Clear the loading timeout since we're processing auth state
        clearTimeout(loadingTimeoutId);

        if (firebaseUser) {
          await handleFirebaseUserAuth(
            firebaseUser,
            flags,
            setUser,
            setError,
            setLoading,
          );
        } else {
          await handleNoFirebaseUser(flags, setUser, setLoading);
        }

        setTimeout(() => {
          setLoading(false);
        }, LOADING_DELAY_MS);
      },
      (err) => {
        // Clear the loading timeout on error
        clearTimeout(loadingTimeoutId);
        console.error('🔐 UserProvider: Auth listener error:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      clearTimeout(loadingTimeoutId);
      unsubscribe();
    };
  }, []);

  // Auth methods using the extracted functions
  const signUpWithEmail = (email: string, password: string) =>
    signUpWithEmailAuth(email, password, setError);

  const loginWithEmail = (email: string, password: string) =>
    loginWithEmailAuth(email, password, setError);

  const authenWithGoogle = () =>
    authenWithGoogleAuth(
      setLoading,
      setError,
      externalLoginInProgressRef,
      signupInProgressRef,
    );

  const signUpWithFacebook = () =>
    signUpWithFacebookAuth(setError, externalLoginInProgressRef);

  const logout = async (): Promise<void> => {
    setLogoutInProgress(true);
    try {
      await logoutAuth(
        setLoading,
        setUser,
        setError,
        authenticatedInSessionRef,
      );
    } finally {
      setLogoutInProgress(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: logoutInProgress ? null : user, // Immediately show logged out state
        isAuthenticated: logoutInProgress ? false : !!user,
        isOnboard: logoutInProgress ? false : (user?.isOnboard ?? false),
        error,
        loading,
        loginWithEmail,
        signUpWithEmail,
        logout,
        authenWithGoogle,
        signUpWithFacebook,
        loginWithFacebook: signUpWithFacebook,
        setUser,
        setError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
