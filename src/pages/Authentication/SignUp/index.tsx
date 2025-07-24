import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/user';
import { validateEmail, validatePassword } from '@/utils/validation';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const {
    signUpWithEmail,
    authenWithGoogle,
    // signUpWithFacebook,
    user,
    loading,
  } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Navigate when user state changes after successful login/signup
  useEffect(() => {
    if (user && !loading) {
      if (!user.isOnboard) {
        navigate('/onboarding');
      } else {
        navigate('/explore');
      }
    }
  }, [user, loading, navigate]); // To navigate after signup

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    const validationError = validatePassword(passwordValue);
    setPasswordError(validationError || '');
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    const validationError = validateEmail(emailValue);
    setEmailError(validationError || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous error
    setEmailError('');
    setPasswordError('');

    // Validate email before submitting
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Validate password before submitting
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      const token = await signUpWithEmail(email, password); // Get the token
      localStorage.setItem('user_verify', token);
      navigate(`/activate-account/${token}`); // Redirect to the activate-account page with the token
    } catch (err) {
      let errorMessage = '';
      if (err instanceof AxiosError) {
        const code = err.code;
        switch (code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Already used email. Please try with another';
            break;
          case 'auth/invalid-email':
            setEmailError('Invalid email. Please try again');
            break;
          case 'auth/missing-password':
            setPasswordError('Missing password. Please try again');
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Overload sign up request. Please try again';
            break;
          default:
            errorMessage = err.message;
        }
      }
      if (err instanceof Error) {
        console.log('name', err.name);
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(''); // Clear any previous errors
      await authenWithGoogle();
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

  return (
    <div className="flex-1 space-y-4 px-10 py-8 md:px-0 lg:px-20">
      <div className="flex flex-col space-x-3">
        <h1 className="text-mountain-800 dark:text-mountain-50 text-xl leading-6 font-bold xl:text-2xl">
          Join us!
        </h1>
        <p className="text-mountain-600 dark:text-mountain-300 mt-2 text-lg font-bold text-nowrap lg:text-xl xl:text-2xl">
          Create an ArtShare account
        </p>
        <p className="text-mountain-500 dark:text-mountain-300 mt-4 text-xs xl:text-sm xl:text-nowrap">
          Join a vibrant community where you can create, share, & celebrate art.
        </p>
      </div>
      <div className="mt-4 flex flex-col justify-between space-y-4 space-x-4">
        {/* Google Login */}
        <div className="flex w-full">
          <Button
            variant={'outline'}
            className="border-mountain-950 dark:border-mountain-700 text-mountain-950 dark:text-mountain-50 flex h-10 w-full items-center justify-center rounded-lg border px-4 py-3 text-sm font-normal hover:cursor-pointer hover:brightness-115 focus:ring-2 focus:outline-none"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="size-5" />
            <span>Continue with Google</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center space-x-4 text-center">
        <hr className="border-mountain-900 w-full border-t-1" />
        <div className="text-mountain-600 text-sm">Or</div>
        <hr className="border-mountain-900 w-full border-t-1" />
      </div>

      {/* Sign-up Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="text-mountain-600 dark:text-mountain-50 block text-sm font-semibold"
          >
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="dark:bg-mountain-900 border-mountain-800 text-mountain-950 dark:text-mountain-50 mt-1 h-10 w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={handleEmailChange}
          />
          {emailError && emailError.length > 0 && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {emailError}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="text-mountain-600 dark:text-mountain-50 block text-sm font-medium"
          >
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            className={`dark:bg-mountain-900 text-mountain-950 dark:text-mountain-50 mt-1 h-10 w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:outline-none ${
              passwordError
                ? 'border-red-500 focus:ring-red-500'
                : password && (!passwordError || passwordError != '')
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-mountain-800 focus:ring-blue-500'
            }`}
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError && passwordError.length > 0 && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {passwordError}
            </p>
          )}
          {password && !passwordError ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Password requirements satisfied!
              </p>
            </div>
          ) : (
            <p className="text-mountain-500 dark:text-mountain-400 mt-1 text-xs">
              At least 8 characters with numbers & symbols
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-mountain-800 hover:bg-mountain-700 dark:text-mountain-50 h-10 w-full rounded-lg py-3 font-bold text-white hover:cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900"
        >
          Sign Up With Email
        </Button>
      </form>
      {/* Display error and success messages */}
      {error && error.length > 0 && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-6 text-left">
        <p className="text-mountain-600 dark:text-mountain-100 text-xs xl:text-sm">
          Already have an account?
          <Link
            to="/login"
            className="ml-2 text-indigo-600 dark:text-indigo-300"
          >
            Login
          </Link>
        </p>
      </div>

      <div className="text-mountain-500 dark:text-mountain-300 mt-4 text-center text-[10px] lg:text-left xl:text-xs">
        <p>
          By signing up for ArtShare, I confirm that I have read and agree to
          the ArtShare{' '}
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

export default SignUp;
