import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { login, signup } from "@/api/authentication/auth";
import { User } from "@/types";
import { getUserProfile } from "@/features/user-profile-private/api/get-user-profile";
import { useNavigate } from "react-router-dom";
import api from "@/api/baseApi";

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnboard: boolean;
  error: string | null;
  loading: boolean | null;
  signUpWithEmail: (
    email: string,
    password: string,
    username: string,
  ) => Promise<string>;
  loginWithEmail: (email: string, password: string) => Promise<string>;
  logout: () => void;
  authenWithGoogle: () => Promise<void>;
  signUpWithFacebook: () => void;
  loginWithFacebook: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Constants for better maintainability
const BACKEND_TOKEN_PROCESSING_DELAY_MS = 100;
const AUTH_RETRY_DELAY_MS = 1000;
const LOADING_DELAY_MS = 300;

// Helper function to clear stale authentication state
const clearStaleAuthState = () => {
  const token = localStorage.getItem("accessToken");
  if (token && !auth.currentUser) {
    console.log("🔐 Clearing stale authentication state");
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const signupInProgressRef = useRef<boolean>(false);

  // Clear any stale authentication state on initialization
  useEffect(() => {
    clearStaleAuthState();
  }, []);

  useEffect(() => {
    console.log("🔐 UserProvider: Setting up auth listener");
    const unsubscribe = auth.onIdTokenChanged(
      async (firebaseUser) => {
        if (firebaseUser) {
          console.log(
            "🔐 UserProvider: Firebase user detected, fetching backend token",
          );

          // If signup is in progress, wait for it to complete
          if (signupInProgressRef.current) {
            console.log("🔐 UserProvider: Signup in progress, waiting...");
            // Wait for signup to complete by polling the flag
            let attempts = 0;
            const maxAttempts = 30; // 15 seconds max wait time
            while (signupInProgressRef.current && attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              attempts++;
            }
            console.log("🔐 UserProvider: Signup wait completed or timed out");
          }

          try {
            const fbToken = await firebaseUser.getIdToken();

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
                  (loginError.message.includes("not found") ||
                    loginError.message.includes("500"));

                if (retryCount >= maxRetries) {
                  // If it's a user not found error after max retries, provide a helpful message
                  if (isUserNotFoundError) {
                    console.error(
                      "🔐 UserProvider: User not found after max retries - this may be a new user sync issue",
                    );
                  }
                  throw loginError; // Max retries reached, throw the error
                }

                // For user not found errors, wait longer before retrying
                const baseDelay = isUserNotFoundError ? 2000 : 1000;
                const delay = Math.min(
                  baseDelay * Math.pow(1.5, retryCount - 1),
                  8000,
                );
                console.log(`🔐 UserProvider: Retrying login in ${delay}ms`);
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }

            if (!loginResponse?.access_token) {
              throw new Error("No access token received from backend");
            }

            localStorage.setItem("accessToken", loginResponse.access_token);
            api.defaults.headers.common["Authorization"] =
              `Bearer ${loginResponse.access_token}`;

            console.log(
              "🔐 UserProvider: Token set, waiting before fetching profile",
            );

            // Add a small delay to ensure the backend has processed the token
            await new Promise((resolve) =>
              setTimeout(resolve, BACKEND_TOKEN_PROCESSING_DELAY_MS),
            );

            console.log("🔐 UserProvider: Fetching user profile");
            const data = await getUserProfile();
            setUser(data);
            console.log("🔐 UserProvider: User profile set successfully");
          } catch (err) {
            console.error("🔐 UserProvider: Error retrieving user token:", err);

            // If it's an authentication error, retry once after a short delay
            if (
              err instanceof Error &&
              (err.message.includes("not authenticated yet") ||
                err.message.includes("500") ||
                err.message.includes("not found"))
            ) {
              console.log(
                "🔐 UserProvider: Auth not ready, retrying in 1000ms",
              );
              setTimeout(async () => {
                try {
                  const data = await getUserProfile();
                  setUser(data);
                  console.log("🔐 UserProvider: Retry successful");
                } catch (retryErr) {
                  console.error("🔐 UserProvider: Retry failed:", retryErr);
                  setError("Failed to retrieve user profile after retry.");
                }
              }, AUTH_RETRY_DELAY_MS);
            } else {
              setError("Failed to retrieve user token.");
            }
          }
        } else {
          console.log("🔐 UserProvider: No Firebase user, clearing state");
          setUser(null);
          // Clear authorization header when user logs out
          delete api.defaults.headers.common["Authorization"];
          localStorage.removeItem("accessToken");
        }
        setTimeout(() => {
          setLoading(false);
        }, LOADING_DELAY_MS);
      },
      (err) => {
        console.error("🔐 UserProvider: Auth listener error:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    // Clear stale auth state on initialization
    clearStaleAuthState();

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (
    email: string,
    password: string,
    username: string,
  ): Promise<string> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      await signup(user.uid, email, "", username);
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const loginWithEmail = async (
    email: string,
    password: string,
  ): Promise<string> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      if (!user?.emailVerified) {
        const errMsg = "Please verify your email before logging in.";
        setError(errMsg);
        throw new Error(errMsg);
      }

      // Don't call getUserProfile here - let onIdTokenChanged handle it
      const token = await user.getIdToken();
      const backendResponse = await login(token);
      if (backendResponse) {
        return token;
      } else {
        const errMsg = "Error during login. Please try again.";
        setError(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const authenWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log("🔐 Starting Google authentication");

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Configure popup to reduce COOP issues
      const result = await signInWithPopup(auth, provider);
      const { user: googleUser } = result;
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

      console.log("🔐 Google auth successful, isNewUser:", isNewUser);

      // For new users, we need to create their backend account first
      if (isNewUser) {
        console.log("🔐 Creating new user in backend");
        signupInProgressRef.current = true; // Set flag to prevent race condition
        try {
          await signup(
            googleUser.uid,
            googleUser.email!,
            "",
            googleUser.displayName || "",
          );
          console.log("🔐 Backend signup successful");

          // Add a small delay to ensure backend user creation is fully propagated
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (signupError) {
          console.error("🔐 Backend signup failed:", signupError);
          // If signup fails, sign out from Firebase to prevent inconsistent state
          await signOut(auth);
          throw new Error("Failed to create account. Please try again.");
        } finally {
          // Clear flag after a slight delay to ensure onIdTokenChanged can see it and wait
          setTimeout(() => {
            signupInProgressRef.current = false;
            console.log("🔐 Signup flag cleared");
          }, 500);
        }
      }

      // Let onIdTokenChanged handle the login flow
      console.log(
        "🔐 Google authentication complete, letting onIdTokenChanged handle login",
      );
    } catch (error) {
      console.error("🔐 Google sign-in error:", error);
      setLoading(false);

      // Clear signup flag immediately on error
      signupInProgressRef.current = false;

      // Handle specific popup errors
      if (error instanceof Error) {
        if (
          error.message.includes("popup-closed-by-user") ||
          error.message.includes("popup-blocked")
        ) {
          throw new Error("Login was cancelled or blocked. Please try again.");
        }
        if (error.message.includes("network-request-failed")) {
          throw new Error(
            "Network error. Please check your connection and try again.",
          );
        }
      }

      setError((error as Error).message);
      throw error;
    }
  };

  const signUpWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const backendResponse = await login(token);
      if (backendResponse.success) {
        navigate("/home", { replace: true });
      } else {
        const signupResponse = await signup(
          user.uid,
          user.email!,
          "",
          user.displayName || "",
        );
        if (signupResponse.success) {
          navigate("/home", { replace: true });
        } else {
          setError("Error with Facebook login.");
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setError(null);
      // Clear authorization header and token
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("accessToken");
      console.log("🔐 UserProvider: Logout complete");
    } catch (error) {
      console.error("🔐 UserProvider: Logout error:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // <- NEW flag
        isOnboard: user?.is_onboard ?? false,
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};