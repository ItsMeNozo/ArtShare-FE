import IGallery, { GalleryPhoto } from '@/components/gallery/Gallery';
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
    return <></>;
  }

  return (
    <IGallery
      photos={photos}
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
