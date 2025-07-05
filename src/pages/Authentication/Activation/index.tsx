import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/firebase'; // Import Firebase auth
import { sendEmailVerification } from 'firebase/auth'; // Import Firebase method for sending verification email
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountActivation = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect to home after successful email verification
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds
      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [success, navigate]);

  const handleVerifyEmail = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        // Send the verification email
        await sendEmailVerification(user);
        setSuccess(true); // Mark the verification as successful
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error sending email verification:', error);
        setError('Failed to send verification email. Please try again later.');
        setSuccess(false); // Mark as failure if error occurs
      }
    } else {
      setError('No user is logged in.');
    }
  };

  // Display success message after email verification
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-bold text-green-600">
        ✅ Email successfully sent! Please check your inbox.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 px-10 py-8 md:px-0 lg:px-10 xl:px-20">
      <div className="flex flex-col space-x-3">
        <h1 className="text-mountain-800 dark:text-mountain-50 text-2xl leading-6 font-bold xl:text-3xl">
          Email Verification
        </h1>
        <p className="text-mountain-500 dark:text-mountain-300 mt-4 text-xs xl:text-sm">
          Thank you for registering with Art Share!
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-mountain-600 dark:text-mountain-50 block text-sm font-semibold"
          >
            Your Email Is:
          </label>
          <Input
            value={auth.currentUser?.email || ''}
            className="dark:bg-mountain-900 border-mountain-800 disabled:text-mountain-950 dark:disabled:text-mountain-100 mt-1 h-10 w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:font-bold"
            disabled
          />
          <p className="text-mountain-500 dark:text-mountain-300 text-xs lg:text-sm">
            In order to start using Art Share, you need to confirm your email
            address by clicking the button below.
          </p>
          <Button
            onClick={handleVerifyEmail}
            type="button"
            className="bg-mountain-800 hover:bg-mountain-700 dark:text-mountain-50 h-10 w-full rounded-lg py-3 font-bold text-white hover:cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900"
          >
            <a href="https://mail.google.com/mail/" target="_blank">
              Verify My Email
            </a>
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Success message */}
        {success && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            ✅ Email successfully sent! Please check your inbox.
          </p>
        )}

        <p className="text-sm text-indigo-600 dark:text-indigo-300">
          If you need any help, don't hesitate to go to the{' '}
          <span className="ml-1 font-bold">Help Center</span>
        </p>
      </div>
    </div>
  );
};

export default AccountActivation;
