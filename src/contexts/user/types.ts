import { User } from '@/types';

export interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnboard: boolean;
  error: string | null;
  loading: boolean | null;
  signUpWithEmail: (email: string, password: string) => Promise<string>;
  loginWithEmail: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  authenWithGoogle: () => Promise<void>;
  signUpWithFacebook: () => void;
  loginWithFacebook: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string) => void;
}

export interface AuthFlags {
  signupInProgressRef: React.MutableRefObject<boolean>;
  externalLoginInProgressRef: React.MutableRefObject<boolean>;
  authStateInitializedRef: React.MutableRefObject<boolean>;
  authenticatedInSessionRef: React.MutableRefObject<boolean>;
}
