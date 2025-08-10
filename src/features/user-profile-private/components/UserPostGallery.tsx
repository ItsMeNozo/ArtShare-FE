import React from 'react';

import IGallery, { GalleryPhoto } from '@/components/gallery/Gallery';

import { Box, CircularProgress, Typography } from '@mui/material';
import { RenderPhotoContext } from 'react-photo-album';
import { UserPostRenderer, UserPostRendererOptions } from './UserPostRenderer';

interface UserPostGalleryProps {
  photoPages: GalleryPhoto[][];
  allPhotosFlat: GalleryPhoto[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  username: string;
  isOwner: boolean;
  onPostDeleted: (postId: number) => void;
}

export const UserPostGallery: React.FC<UserPostGalleryProps> = ({
  photoPages,
  allPhotosFlat,
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
  if (isLoading && allPhotosFlat.length === 0) {
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

  if (!isLoading && isError && allPhotosFlat.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error || 'An error occurred while loading the posts.'}
        </Typography>
      </Box>
    );
  }

  if (!isLoading && !isError && allPhotosFlat.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No posts available.</Typography>
      </Box>
    );
  }

  return (
    <IGallery
      photoPages={photoPages}
      allPhotosFlat={allPhotosFlat}
      isLoading={isLoading}
      isFetchingNextPage={false}
      isError={isError}
      error={error ? new Error(error) : null}
      renderPhoto={renderPhotoCallback}
      hasNextPage={false}
      fetchNextPage={() => {}}
    />
  );
};
