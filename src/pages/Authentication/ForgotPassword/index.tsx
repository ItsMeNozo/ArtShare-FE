import { checkEmailExists } from '@/api/authentication/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission for password reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setError(null);
    setMessage(null);
    setEmail((previousEmail) => previousEmail.trim());

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const emailExistsRes = await checkEmailExists(email);
      console.log('emailExistsRes', emailExistsRes);
      if (emailExistsRes === false) {
        setError(
          'This email address is not registered. Please check your email or sign up for a new account.',
        );
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage(
        'Password reset email sent successfully! Please check your inbox and spam folder.',
      );
    } catch (error: unknown) {
      console.error('Password reset error:', error);

      if (typeof error === 'object' && error !== null && 'code' in error) {
        switch (error.code) {
          case 'auth/user-not-found':
            setError(
              'This email address is not registered. Please check your email or sign up for a new account.',
            );
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/too-many-requests':
            setError('Too many attempts. Please try again later.');
            break;
          case 'auth/network-request-failed':
            setError(
              'Network error. Please check your connection and try again.',
            );
            break;
          case 'auth/invalid-credential':
            setError('This email has not registered yet.');
            break;
          default:
            setError(
              'An error occurred while sending the reset email. Please try again.',
            );
        }
      } else {
        setError(
          'An error occurred while sending the reset email. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 px-10 py-8 md:px-0 lg:px-10 xl:px-20">
      <div className="flex flex-col space-x-3">
        <h1 className="text-mountain-800 dark:text-mountain-50 text-2xl leading-6 font-bold xl:text-3xl">
          Account Recovery
        </h1>
        <p className="text-mountain-500 dark:text-mountain-300 mt-4 text-xs xl:text-sm">
          Recover your account by email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-mountain-600 dark:text-mountain-50 block text-sm font-semibold"
          >
            Enter Your Email
          </label>
          <Input
            placeholder="Input Your Email"
            id="email"
            type="email"
            className="dark:bg-mountain-900 border-mountain-800 mt-1 h-10 w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            className="bg-mountain-800 hover:bg-mountain-700 disabled:bg-mountain-800 dark:text-mountain-50 h-10 w-full rounded-lg py-3 font-bold text-white hover:cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send My Verification Code'}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm text-green-600 dark:text-green-400">
              {message}
            </p>
          </div>
        )}

        <p className="text-sm text-indigo-600 dark:text-indigo-300">
          If you need any help, don't hesitate to go to the
          <span className="ml-1 font-bold">Help Center</span>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
