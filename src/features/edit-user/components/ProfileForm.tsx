import { UserProfile } from '@/features/user-profile-public/api/user-profile.api';
import { Box, TextField, Typography } from '@mui/material';
import type React from 'react';

interface ProfileFormProps {
  formData: UserProfile;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleDateChange?: (date: Date | null, fieldName: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ProfileForm({
  formData,
  handleChange,
  handleDateChange,
  isSubmitting,
}: ProfileFormProps) {
  return (
    <Box className="space-y-6 dark:text-white">
      {/* Email */}
      <Box className="space-y-2">
        <Typography>Email</Typography>
        <TextField
          fullWidth
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          variant="outlined"
          className="rounded bg-[#1e1e1e]"
          InputProps={{ className: 'text-white' }}
        />
      </Box>

      {/* Username */}
      <Box className="space-y-2">
        <Typography>Username</Typography>
        <TextField
          fullWidth
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={isSubmitting}
          variant="outlined"
          className="rounded bg-[#1e1e1e]"
          InputProps={{ className: 'text-white' }}
        />
      </Box>

      {/* Full Name */}
      <Box className="space-y-2">
        <Typography>Full Name</Typography>
        <TextField
          fullWidth
          name="full_name"
          value={formData.full_name || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          variant="outlined"
          className="rounded bg-[#1e1e1e]"
          InputProps={{ className: 'text-white' }}
        />
      </Box>

      {/* Birthday */}
      {handleDateChange && (
        <Box className="space-y-2">
          <Typography>Birthday</Typography>
          <TextField
            fullWidth
            type="date"
            name="birthday"
            value={formData.birthday || ''}
            onChange={(e) =>
              handleDateChange(new Date(e.target.value), 'birthday')
            }
            disabled={isSubmitting}
            variant="outlined"
            className="rounded bg-[#1e1e1e] text-white"
          />
        </Box>
      )}

      {/* Bio */}
      <Box className="space-y-2">
        <Typography>Bio</Typography>
        <TextField
          fullWidth
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          variant="outlined"
          multiline
          rows={4}
          className="rounded bg-[#1e1e1e]"
          InputProps={{ className: 'text-white' }}
        />
      </Box>
    </Box>
  );
}
