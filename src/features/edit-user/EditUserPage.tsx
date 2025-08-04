import { Box, Container } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getUserProfile,
  UserProfile,
} from '../user-profile-public/api/user-profile.api';
import { AvatarSection } from './components/AvatarSection';
import EditProfileForm from './components/EditProfileForm';

export default function EditUser() {
  const { data: profileData, isLoading: loadingProfile } = useQuery<
    UserProfile,
    Error
  >({
    queryKey: ['userProfile'],
    queryFn: () => getUserProfile(),
  });

  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  const handleAvatarChange = (file: File, previewUrl: string) => {
    setNewAvatarFile(file);
    setFormData((prev) =>
      prev ? { ...prev, profilePictureUrl: previewUrl } : prev,
    );
  };

  const handleSaveSuccess = () => {
    setNewAvatarFile(null);
  };

  if (loadingProfile || !formData) {
    return (
      <div className="m-4 text-center text-slate-700 dark:text-slate-200">
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
          onAvatarChange={handleAvatarChange}
        />
      </Box>

      <EditProfileForm
        initialData={formData}
        newAvatarFile={newAvatarFile}
        onSaveSuccess={handleSaveSuccess}
      />
    </Container>
  );
}
