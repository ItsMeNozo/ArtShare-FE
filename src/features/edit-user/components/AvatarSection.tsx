import { getPresignedUrl, uploadFile } from '@/api/storage';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Backdrop, Box, CircularProgress, IconButton } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import Avatar from 'boring-avatars';
import { Edit2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { ChangeEvent, useEffect, useState } from 'react';
import { updateUserProfile } from '../api/user-profile.api';
interface AvatarSectionProps {
  profilePictureUrl?: string | null;
  onUploadSuccess: (newUrl: string) => void;
  username?: string;
}

export function AvatarSection({
  profilePictureUrl,
  onUploadSuccess,
  username,
}: AvatarSectionProps) {
  const [preview, setPreview] = useState<string | null>(
    profilePictureUrl || null,
  );
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setPreview(profilePictureUrl ?? null);
  }, [profilePictureUrl]);

  const uploadMutation = useMutation<string, Error, File>({
    mutationFn: async (file) => {
      const ext = file.type.split('/')[1];
      const key = `avatars/${nanoid(8)}.${ext}`;
      const { presignedUrl, fileUrl } = await getPresignedUrl(
        key,
        ext,
        'image',
        'users',
      );
      await uploadFile(file, presignedUrl);
      return fileUrl;
    },
    onSuccess: async (fileUrl) => {
      await updateUserProfile({ profile_picture_url: fileUrl });
      setPreview(fileUrl);
      onUploadSuccess(fileUrl);
      showSnackbar('Avatar updated', 'success');
    },
    onError: (err) => {
      showSnackbar(err.message || 'Failed to upload avatar', 'error');
    },
  });

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // immediate preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setPreview(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    uploadMutation.mutate(file);
  };

  return (
    <>
      <Backdrop open={uploadMutation.isPending} sx={{ zIndex: 999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box className="flex flex-col items-center">
        <Box className="relative h-24 w-24">
          {/* 1) Crop the photo */}
          <div className="h-full w-full overflow-hidden rounded-full bg-gray-700">
            {preview ? (
              <img
                src={preview}
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              // 2) Show a boring-avatar when there's no preview
              <Avatar
                size={96} // match the Box 24×24 (px * 4)
                name={username || 'Unknown'}
                variant="beam" // pick your favorite style
                colors={['#84bfc3', '#ff9b62', '#d96153']}
              />
            )}
          </div>

          {/* 2) Overlay IconButton */}
          <IconButton
            component="label"
            size="small"
            disabled={uploadMutation.isPending}
            sx={{
              position: 'absolute',
              bottom: 4,
              right: 3,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              width: 32,
              height: 32,
            }}
          >
            <Edit2 fontSize="small" />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploadMutation.isPending}
            />
          </IconButton>
        </Box>
      </Box>
    </>
  );
}
