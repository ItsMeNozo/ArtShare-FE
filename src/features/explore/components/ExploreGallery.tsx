import IGallery from '@/components/gallery/Gallery';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import React, { useMemo } from 'react';
import { useGetPosts } from '../hooks/useGetPosts';
import { ExploreTab } from '../types';

interface ExploreGalleryProps {
  tab: ExploreTab;
  selectedAttribute: string | null;
  selectedMediums: string[];
  isAi: boolean;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({
  tab,
  selectedAttribute,
  selectedMediums,
  isAi,
}) => {
  const {
    data: postsData,
    error: postsError,
    isError: isPostsError,
    isLoading: isLoadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPosts({
    tab,
    mediums: selectedMediums,
    attribute: selectedAttribute,
    isAi,
  });

  const { photoPages, isProcessing: isProcessingPhotos } = useGalleryPhotos(
    postsData?.pages,
  );

  const isInitialLoading =
    isLoadingPosts || (isProcessingPhotos && photoPages.length === 0);

  const isFetchingMore =
    isFetchingNextPage || (isProcessingPhotos && photoPages.length > 0);

  const allPhotosFlat = useMemo(() => photoPages.flat(), [photoPages]);

  return (
    <IGallery
      photoPages={photoPages}
      allPhotosFlat={allPhotosFlat}
      isLoading={isInitialLoading}
      isFetchingNextPage={isFetchingMore}
      isError={isPostsError}
      error={postsError}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};
