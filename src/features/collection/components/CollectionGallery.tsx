import IGallery, { GalleryPhoto } from '@/components/gallery/Gallery';
import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';
import { RenderPhotoContext } from 'react-photo-album';
import { SelectedCollectionId } from '../types/collection';
import {
  CollectionImageRenderer,
  CollectionImageRendererOptions,
} from './CollectionImageRenderer';

interface CollectionGalleryProps {
  photos: GalleryPhoto[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  selectedCollectionId: SelectedCollectionId;
  onRemovePost: (postId: number) => void;
  isReadOnly?: boolean;
}

export const CollectionGallery: React.FC<CollectionGalleryProps> = ({
  photos,
  isLoading,
  isError,
  error,
  onRemovePost,
  selectedCollectionId,
  isReadOnly = false,
}) => {
  const renderPhotoCallback = React.useCallback(
    (_: unknown, context: RenderPhotoContext<GalleryPhoto>) => {
      const options: CollectionImageRendererOptions = {
        onRemovePost,
        selectedCollectionId,
        isReadOnly,
      };

      return CollectionImageRenderer(context, options);
    },
    [onRemovePost, selectedCollectionId, isReadOnly],
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
          {error || 'An error occurred while loading the gallery.'}
        </Typography>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          This collection has no items.
        </Typography>
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
