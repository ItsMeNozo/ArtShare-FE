import api from '@/api/baseApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextareaAutosize } from '@mui/material';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

// SHADCN Dialog helpers
import { getUserProfile } from '@/api/authentication/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/contexts/user';
import { User } from '@/types';
import axios, { AxiosError } from 'axios';

// Constants
const SUCCESS_MESSAGE_TIMEOUT_MS = 1500;

interface ProfileForm {
  fullName: string;
  username: string;
  bio?: string;
  birthday: string;
}

const OnboardingProfile: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProfileForm>({
    defaultValues: {
      fullName: '',
      username: '',
      bio: '',
      birthday: '',
    },
  });
  const { user, setUser } = useUser();

  /* dialog state */
  const [open, setOpen] = useState(true); // Set dialog to open by default
  const [popMessage, setPopMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const showDialog = (ok: boolean, text: string) => {
    setPopMessage({ ok, text });
    setOpen(true);
  };

  // Age validation function (user must be at least 13 years old)
  const isAbove13 = (birthday: string) => {
    const birthDate = new Date(birthday);
    const currentDate = new Date();

    // Calculate the age by comparing the year
    let age = currentDate.getFullYear() - birthDate.getFullYear();

    // If the birth date hasn't occurred yet this year, subtract 1 from age
    if (
      currentDate.getMonth() < birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() &&
        currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 13;
  };

  const onSubmit = async (raw: ProfileForm) => {
    // Age check
    if (raw.birthday && !isAbove13(raw.birthday)) {
      showDialog(false, 'You must be at least 13 years old.');
      return;
    }

    const payload: ProfileForm = {
      ...raw,
      birthday: new Date(raw.birthday).toISOString(),
    };

    try {
      await api.patch('/users/profile', payload);
      // mark them onboarded in context so guards will let them through
      const updatedUser: User = await getUserProfile(user!.id);
      setUser!(updatedUser);

      // Show success message first
      showDialog(true, 'Profile completed successfully!');
      reset(raw);

      // Navigate after showing success message for better UX
      setTimeout(() => {
        setOpen(false);
        navigate('/explore', { replace: true });
      }, SUCCESS_MESSAGE_TIMEOUT_MS);
    } catch (err: unknown) {
      // ──── 1. Axios error? ───────────────────────────────────────
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>;

        const msg = axiosErr.response?.data?.message ?? axiosErr.message;

        if (msg.includes('Duplicate value for field(s): username')) {
          showDialog(
            false,
            'Username already exists. Please choose a different username.',
          );
          document.getElementById('username')?.focus();
        } else {
          showDialog(false, msg || 'Failed to update profile');
        }
        return;
      }

      // ──── 2. Plain JS Error ─────────────────────────────────────
      if (err instanceof Error) {
        showDialog(false, err.message);
        return;
      }

      // ──── 3. Unknown thrown value (string, number, etc.) ────────
      showDialog(false, 'Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        hideCloseButton
        className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Complete your profile
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="fullName"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="fullName"
              placeholder="Your Fullname"
              {...register('fullName', { required: true, maxLength: 80 })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500">Full Name is required</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="username"
            >
              Username <span className="text-rose-500">*</span>
            </label>
            <Input
              id="username"
              placeholder="Your Username"
              {...register('username', {
                required: {
                  value: true,
                  message: 'Username is required',
                },
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
                maxLength: {
                  value: 20,
                  message: 'Username must be at most 20 characters',
                },
                pattern: {
                  // no spaces anywhere + only a–z, 0–9, _ or –, length 3–20
                  value: /^(?!.*\s)[a-z0-9_-]{3,20}$/i,
                  message:
                    'Use only lowercase letters, numbers, _, and - (no spaces)',
                },
              })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />

            {/* Error handling */}
            {errors.username && (
              <p className="text-xs text-rose-500">{errors.username.message}</p>
            )}
          </div>

          {/* Birthday */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="birthday"
            >
              Birthday <span className="text-rose-500">*</span>
            </label>
            <Input
              id="birthday"
              type="date"
              {...register('birthday', {
                required: 'Birthday is required',
                validate: (value) =>
                  typeof value === 'string' && isAbove13(value)
                    ? true
                    : 'You must be at least 13 years old.',
              })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />

            {errors.birthday && (
              <p className="text-xs text-rose-500">{errors.birthday.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="bio"
            >
              Bio (optional)
            </label>
            <TextareaAutosize
              id="bio"
              minRows={3}
              maxLength={150}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="A short description about you"
              {...register('bio')}
              style={{ resize: 'none' }}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {150 - (watch('bio')?.length || 0)} characters left
            </p>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex w-full justify-center rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
        {popMessage && (
          <div className="mt-4 flex flex-col items-center justify-center">
            {popMessage.ok ? (
              <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="mb-2 h-8 w-8 text-rose-500" />
            )}
            <span
              className={`text-base font-medium ${popMessage.ok ? 'text-green-700 dark:text-green-400' : 'text-rose-700 dark:text-rose-400'}`}
            >
              {popMessage.text}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingProfile;
