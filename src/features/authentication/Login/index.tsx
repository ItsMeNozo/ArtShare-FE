import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/user';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const {
    loginWithEmail,
    authenWithGoogle,
    isAuthenticated,
    isOnboard,
  } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message] = useState<string | null>(null);
  const navigate = useNavigate(); // To navigate after login

  // Navigate when user state changes after successful login
  useEffect(() => {
    if (isAuthenticated && isOnboard) navigate('/onboarding');
    if (isAuthenticated) navigate('/explore');
  }, [isAuthenticated, isOnboard, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    try {
      await loginWithEmail(email, password);
      // The UserProvider will handle fetching profile and setting user state
      // We'll navigate after the user state is updated
    } catch (err: unknown) {
      let errorMessage = '';

      // Handle Firebase Auth errors (they have a .code property)
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message?: string };
        const code = firebaseError.code;
        switch (code) {
          case 'auth/invalid-credential':
          case 'auth/invalid-login-credentials':
            errorMessage =
              'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/wrong-password':
            setPasswordError('Incorrect password. Please try again.');
            break;
          case 'auth/email-not-verified':
          case 'auth/user-not-verified':
            errorMessage = 'Please verify your email before logging in.';
            break;
          case 'auth/invalid-email':
            setEmailError(
              'Invalid email format. Please enter a valid email address.',
            );
            break;
          case 'auth/missing-password':
            setPasswordError(
              'Password is required. Please enter your password.',
            );
            break;
          case 'auth/user-not-found':
            errorMessage =
              'No account found with this email. Please sign up first.';
            break;
          case 'auth/too-many-requests':
            errorMessage =
              'Too many failed login attempts. Please try again later.';
            break;
          default:
            errorMessage =
              firebaseError.message || 'Login failed. Please try again.';
        }
      }
      // Handle Axios errors
      else if (err instanceof AxiosError) {
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Network error. Please try again.';
      }
      // Handle other errors including the INVALID_LOGIN_CREDENTIALS case
      else if (err instanceof Error) {
        if (
          err.message?.includes('INVALID_LOGIN_CREDENTIALS') ||
          err.message?.includes('invalid-login-credentials')
        ) {
          errorMessage =
            'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      setError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    setError(''); // Clear previous error
    try {
      await authenWithGoogle(); // Call Google login function from UserProvider
      // The UserProvider will handle fetching profile and setting user state
      // We'll navigate after the user state is updated
    } catch (error) {
      console.error('Google login error:', error);
      let message = 'Something went wrong. Please try again.';

      if (error instanceof Error) {
        // Handle Firebase Auth errors and our custom errors
        if (error.message.includes('popup-closed-by-user')) {
          message =
            'Login was cancelled. You closed the popup before signing in.';
        } else if (error.message.includes('popup-blocked')) {
          message =
            'The login popup was blocked by your browser. Please enable popups and try again.';
        } else if (error.message.includes('cancelled-popup-request')) {
          message = 'Login was interrupted by another popup request.';
        } else if (
          error.message.includes('account-exists-with-different-credential')
        ) {
          message =
            'An account already exists with a different sign-in method. Try logging in using that method.';
        } else if (error.message.includes('network-request-failed')) {
          message =
            'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Failed to create account')) {
          message = error.message; // Use our custom error message
        } else {
          message = error.message;
        }
      } else if (error instanceof AxiosError) {
        const code = error.code;
        switch (code) {
          case 'auth/popup-closed-by-user':
            message =
              'Login was cancelled. You closed the popup before signing in.';
            break;
          case 'auth/cancelled-popup-request':
            message = 'Login was interrupted by another popup request.';
            break;
          case 'auth/account-exists-with-different-credential':
            message =
              'An account already exists with a different sign-in method. Try logging in using that method.';
            break;
          case 'auth/popup-blocked':
            message =
              'The login popup was blocked by your browser. Please enable popups and try again.';
            break;
          default:
            message = error.message;
        }
      }
      setError(message);
    }
  };

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // Clear errors when user starts typing
    if (emailError) setEmailError('');
    if (error) setError('');
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    // Clear errors when user starts typing
    if (passwordError) setPasswordError('');
    if (error) setError('');
  }

  return (
    <div className="flex-1 space-y-4 py-8">
      <div className="flex flex-col space-x-3">
        <h1 className="font-bold text-mountain-800 dark:text-mountain-50 text-xl xl:text-2xl leading-6">
          Welcome back!
        </h1>
        <p className="mt-2 font-bold text-mountain-600 dark:text-mountain-300 text-xl xl:text-2xl">
          Login to your account
        </p>
        <p className="mt-4 text-mountain-500 dark:text-mountain-300 text-xs xl:text-sm">
          It's nice to see you again. Ready to showcase your art?
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label
            htmlFor="username"
            className="block font-semibold text-mountain-600 dark:text-mountain-50 text-sm"
          >
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your username or email"
            className="dark:bg-mountain-900 shadow-sm mt-1 p-3 border border-mountain-800 rounded-lg focus:ring-indigo-500 w-full h-10 text-mountain-950 dark:text-mountain-50 placeholder:text-mountain-400"
            value={email}
            onChange={(e) => {
              handleEmailChange(e);
            }}
          />
          {/* Display error and success messages */}
          {emailError && emailError.length > 0 && (
            <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {emailError}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block font-medium text-mountain-600 dark:text-mountain-50 text-sm"
          >
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            className="dark:bg-mountain-900 shadow-sm mt-1 p-3 border border-mountain-800 rounded-lg focus:ring-indigo-500 w-full h-10 text-mountain-950 dark:text-mountain-50 placeholder:text-mountain-400"
            value={password}
            onChange={handlePasswordChange}
          />
          {/* Display error and success messages */}
          {passwordError && passwordError.length > 0 && (
            <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {passwordError}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <label className="flex items-center text-mountain-500 text-sm">
            <input type="checkbox" className="mr-2" />
            Remember me
          </label>
          <div className="text-indigo-600 dark:text-indigo-300 text-sm">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>
        <Button
          type="submit"
          className="bg-mountain-800 hover:bg-mountain-700 dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900 hover:brightness-110 py-3 rounded-lg focus:ring-indigo-500 w-full h-10 font-bold text-mountain-50 hover:cursor-pointer"
        >
          Login
        </Button>
      </form>

      {/* Display error and success messages */}
      {error && error.length > 0 && (
        <p className="mt-4 text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      {message && (
        <p className="mt-4 text-green-600 dark:text-green-400 text-sm">
          {message}
        </p>
      )}

      <div className="flex items-center space-x-4 mt-6 text-center">
        <hr className="border-mountain-900 border-t-1 w-full" />
        <div className="text-mountain-600 text-sm">Or</div>
        <hr className="border-mountain-900 border-t-1 w-full" />
      </div>

      <div className="flex flex-col justify-between space-x-4 space-y-4 mt-4">
        <div className="flex w-full">
          <Button
            variant={'outline'}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg w-full h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="size-5" />
            <span>Continue with Google</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 text-left">
        <p className="text-mountain-600 dark:text-mountain-50 text-xs xl:text-sm">
          Don’t have an account?
          <Link
            to="/signup"
            className="ml-2 text-indigo-600 dark:text-indigo-300"
          >
            Register
          </Link>
        </p>
      </div>
      <div className="mt-4 text-[10px] text-mountain-500 dark:text-mountain-300 xl:text-xs lg:text-left text-center">
        <p>
          By logging in to ArtShare, I confirm that I have read and agree to the
          ArtShare{' '}
          <a href="#" className="text-indigo-600 dark:text-indigo-300">
            Terms of Service
          </a>{' '}
          -{' '}
          <a href="#" className="text-indigo-600 dark:text-indigo-300">
            Privacy Policy
          </a>{' '}
          regarding data usage.
        </p>
      </div>
    </div>
  );
};

export default Login;
