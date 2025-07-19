import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

import IGallery, { GalleryPhoto } from '@/components/gallery/Gallery';

import { RenderPhotoContext } from 'react-photo-album';
import { UserPostRenderer, UserPostRendererOptions } from './UserPostRenderer';

interface UserPostGalleryProps {
  photos: GalleryPhoto[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  username: string;
  isOwner: boolean;
  onPostDeleted: (postId: number) => void;
}

export const UserPostGallery: React.FC<UserPostGalleryProps> = ({
  photos,
  isLoading,
  isError,
  error,
  username,
  isOwner,
  onPostDeleted,
}) => {
  const renderPhotoCallback = React.useCallback(
    (_: unknown, context: RenderPhotoContext<GalleryPhoto>) => {
      const options: UserPostRendererOptions = {
        isOwner,
        onPostDeleted,
        username,
      };

      return UserPostRenderer(context, options);
    },
    [isOwner, onPostDeleted, username],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '16rem',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error || 'An error occurred while loading the posts.'}
        </Typography>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No posts available.</Typography>
      </Box>
    );
  }

  return (
    <IGallery
      photos={photos}
      isLoading={isLoading}
      isFetchingNextPage={false}
      isError={isError}
      error={error ? new Error(error) : null}
      renderPhoto={renderPhotoCallback}
    />
  );
};
