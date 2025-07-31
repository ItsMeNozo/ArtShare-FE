import { Box, IconButton } from '@mui/material';
import Avatar from 'boring-avatars';
import { Edit2 } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
interface AvatarSectionProps {
  profilePictureUrl?: string | null;
  username?: string;
  onAvatarChange: (file: File, previewUrl: string) => void;
}

export function AvatarSection({
  profilePictureUrl,
  username,
  onAvatarChange,
}: AvatarSectionProps) {
  const [preview, setPreview] = useState<string | null>(
    profilePictureUrl || null,
  );

  useEffect(() => {
    setPreview(profilePictureUrl ?? null);
  }, [profilePictureUrl]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleAvatarSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);

    setPreview(localPreviewUrl);

    onAvatarChange(file, localPreviewUrl);
  };

  return (
    <Box className="flex flex-col items-center">
      <Box className="relative h-24 w-24">
        <div className="h-full w-full overflow-hidden rounded-full bg-gray-700">
          {preview ? (
            <img
              src={preview}
              alt="User avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Avatar
              size={96}
              name={username || 'Unknown'}
              variant="beam"
              colors={['#84bfc3', '#ff9b62', '#d96153']}
            />
          )}
        </div>

        <IconButton
          component="label"
          size="small"
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
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarSelect}
          />
        </IconButton>
      </Box>
    </Box>
  );
}
