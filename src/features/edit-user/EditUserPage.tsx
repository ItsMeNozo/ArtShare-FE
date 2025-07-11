import { Box, Container } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getUserProfile,
  UserProfile,
} from '../user-profile-public/api/user-profile.api'; // Make sure this path is correct
import { AvatarSection } from './components/AvatarSection';
import EditProfileForm from './components/EditProfileForm'; // Already has dark mode considerations

export default function EditUser() {
  const { data: profileData, isLoading: loadingProfile } = useQuery<
    UserProfile,
    Error
  >({
    queryKey: ['userProfile'],
    queryFn: () => getUserProfile(),
  });

  // formData is used for AvatarSection's immediate display and updates
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  if (loadingProfile || !formData) {
    return (
      <div className="m-4 text-center text-slate-700 dark:text-slate-200">
        {/* Adjusted text color for light and dark modes */}
        Loading....
      </div>
    );
  }

  return (
    <Container disableGutters className={'h-full min-h-screen px-15 pt-6'}>
      <Box>
        <AvatarSection
          profilePictureUrl={formData.profilePictureUrl}
          username={formData.username}
          onUploadSuccess={(newUrl: string) =>
            setFormData((prev) =>
              prev ? { ...prev, profilePictureUrl: newUrl } : prev,
            )
          }
          // AvatarSection itself might need internal dark mode styling for its elements
        />
      </Box>

      {/* 
        EditProfileForm receives `profileData` (the last fetched state from backend).
        If `AvatarSection` updates the avatar, `formData` changes, but `EditProfileForm`'s 
        `initialData` won't reflect this specific avatar change until `profileData` itself is refetched.
        This component (EditProfileForm) was already styled for dark mode in the previous step,
        including its own background (e.g., dark:bg-mountain-900) and white input fields.
      */}
      {profileData && <EditProfileForm initialData={profileData} />}
    </Container>
  );
}
