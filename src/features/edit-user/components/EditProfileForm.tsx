import { Button } from '@/components/ui/button'; // Using shadcn/ui Button
import { Input } from '@/components/ui/input';
import { UserProfile } from '@/features/user-profile-public/api/user-profile.api';
import { useSnackbar } from '@/hooks/useSnackbar';
import { cn } from '@/lib/utils';
import { Box, TextareaAutosize, Typography } from '@mui/material'; // Removed Button from here as it's not used with MUI styles
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { updateUserProfile } from '../api/user-profile.api';

export const EditProfileForm: React.FC<{ initialData: UserProfile }> = ({
  initialData,
}) => {
  const { showSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UserProfile>({
    defaultValues: {
      ...initialData,
      birthday: initialData.birthday ? initialData.birthday.slice(0, 10) : '',
    },
  });

  const isAbove13 = (birthday: string) => {
    const birth = new Date(birthday);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age >= 13;
  };

  const onSubmit = async (raw: UserProfile) => {
    if (raw.birthday && !isAbove13(raw.birthday)) {
      showSnackbar('You must be at least 13 years old.', 'error');
      return;
    }

    const payload = {
      ...raw,
      birthday: new Date(raw.birthday ?? '').toISOString(),
    };

    try {
      await updateUserProfile(payload);
      reset(raw);
      showSnackbar('Profile updated successfully!', 'success');
    } catch (err: unknown) {
      let msg = 'Failed to update profile';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || err.message;
        console.log(err);
        if (msg.includes('Duplicate value for field(s): username')) {
          showSnackbar(
            'Username already exists. Please choose a different username.',
            'error',
          );
          document.getElementById('username')?.focus();
          return;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      showSnackbar(msg, 'error');
    }
  };

  // Define common classes for inputs
  const customInputClassName = cn(
    // Light Mode Styles (remain the same)
    'bg-mountain-50',
    'text-slate-800',
    'placeholder:text-slate-500',
    'border-slate-300', // Default border color
    'hover:border-slate-400', // Hover border color

    // Dark Mode Styles (Updated for darker input background)
    'dark:bg-mountain-950', // Very dark background for input, darker than mountain-900 (e.g., slate-800)
    'dark:text-slate-200', // Light text for contrast on very dark background
    'dark:placeholder:text-slate-500', // Dimmer placeholder text
    'dark:border-slate-700', // Border color (lighter than input bg, darker than form bg if form is lighter)
    'dark:hover:border-slate-600', // Hover border color for dark mode
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className="dark:bg-mountain-900 mt-5 max-w-screen rounded-none p-6 dark:rounded-md" // Parent form background
    >
      {/* Full Name */}
      <Box className="mb-4">
        <Typography className="text-foreground mb-1 font-medium">
          Full Name <span className="text-rose-500">*</span>
        </Typography>
        <Input
          id="fullName"
          placeholder="Your Fullname"
          {...register('fullName', {
            required: 'Full Name is required',
            maxLength: 80,
          })}
          className={customInputClassName}
        />
        {errors.fullName && (
          <Typography color="error" variant="caption">
            {errors.fullName.message}
          </Typography>
        )}
      </Box>

      {/* Username */}
      <Box className="mb-4">
        <Typography className="text-foreground mb-1 font-medium">
          Username <span className="text-rose-500">*</span>
        </Typography>
        <Input
          id="username"
          placeholder="Your Username"
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 3, message: 'At least 3 characters' },
            maxLength: { value: 20, message: 'At most 20 characters' },
            pattern: {
              value: /^(?!.*\s)[a-z0-9_-]{3,20}$/i,
              message: 'Use letters, numbers, _ or - (no spaces)',
            },
          })}
          className={customInputClassName}
        />
        {errors.username && (
          <Typography color="error" variant="caption">
            {errors.username.message}
          </Typography>
        )}
      </Box>

      {/* Birthday */}
      <Box className="mb-4">
        <Typography className="text-foreground mb-1 font-medium">
          Birthday <span className="text-rose-500">*</span>
        </Typography>
        <Input
          id="birthday"
          type="date"
          {...register('birthday', {
            required: 'Birthday is required',
            validate: (v) =>
              isAbove13(v ? v : '') || 'You must be at least 13 years old.',
          })}
          className={customInputClassName}
        />
        {errors.birthday && (
          <Typography color="error" variant="caption">
            {errors.birthday.message}
          </Typography>
        )}
      </Box>

      {/* Bio */}
      <Box className="mb-6">
        <Typography className="text-foreground mb-1 font-medium">
          Bio (optional)
        </Typography>
        <TextareaAutosize
          minRows={3}
          maxLength={150}
          placeholder="A short description about you"
          {...register('bio')}
          className={cn(
            // Base structure & shadcn-like styles (ensure 'border' class is present)
            'w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow]',
            'selection:bg-primary selection:text-primary-foreground',
            'resize-none outline-none',
            // Custom styles for background, text, placeholder, and border
            customInputClassName,
            // Specific focus for TextareaAutosize
            'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[2px]',
            'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
          )}
        />
        <Typography
          variant="caption"
          className="text-gray-500 dark:text-gray-400"
        >
          {150 - (watch('bio')?.length || 0)} characters left
        </Typography>
      </Box>

      {/* Submit */}
      <Box className="text-right">
        {/* Using shadcn/ui Button now based on imports, custom sx styling removed unless you add it back */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white hover:from-indigo-800 hover:via-purple-800 hover:to-indigo-900"
          // The MUI sx prop styling was removed. The classes above replicate a gradient.
          // If you still want the exact MUI sx styling, you'd need to import Button from @mui/material
          // and apply the sx prop as you had it.
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfileForm;
