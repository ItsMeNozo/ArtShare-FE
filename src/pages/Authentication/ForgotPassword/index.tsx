import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/firebase'; // Firebase auth instance
import { sendPasswordResetEmail } from 'firebase/auth'; // Import the Firebase method for sending password reset email
import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); // To display success/error messages
  const [loading, setLoading] = useState(false); // For loading state during API call
  const [error, setError] = useState<string | null>(null); // For storing error message

  // Handle form submission for password reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        'Password reset email sent successfully! Please check your inbox.',
      );
      setError(null); // Clear any previous error messages
    } catch (error) {
      setMessage(null); // Clear any success message if an error occurs
      setError((error as Error).message); // Handle Firebase error (invalid email, etc.)
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
          Return your account by email
        </p>
      </div>
      <div className="space-y-4">
        {/* Step 1: Enter Email */}
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
            className="dark:bg-mountain-900 border-mountain-800 mt-1 h-10 w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            className="bg-mountain-800 hover:bg-mountain-700 disabled:bg-mountain-800 dark:text-mountain-50 h-10 w-full rounded-lg py-3 font-bold text-white hover:cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send My Verification Code'}
          </Button>
        </div>
        {/* Error or success message */}
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {message && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            {message}
          </p>
        )}
        <p className="text-sm text-indigo-600 dark:text-indigo-300">
          If you need any help, don't hesitate to go to the
          <span className="ml-1 font-bold">Help Center</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
