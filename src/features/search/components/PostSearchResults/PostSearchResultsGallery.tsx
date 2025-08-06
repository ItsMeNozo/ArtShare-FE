import IGallery from '@/components/gallery/Gallery';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import React, { useMemo } from 'react';
import { useSearchPosts } from '../../hooks/useSearchPosts';

interface PostSearchResultsGalleryProps {
  finalQuery: string | null;
  selectedAttribute: string | null;
  selectedMediums: string[];
  isAi: boolean;
}

export const PostSearchResultsGallery: React.FC<
  PostSearchResultsGalleryProps
> = ({ finalQuery, selectedAttribute, selectedMediums, isAi }) => {
  const {
    data: postsData,
    error: postsError,
    isError: isPostsError,
    isLoading: isLoadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchPosts({
    finalQuery,
    attribute: selectedAttribute,
    mediums: selectedMediums,
    isAi,
    enabled: !!finalQuery && finalQuery.length > 0,
  });

  const { photoPages, isProcessing: isProcessingPhotos } = useGalleryPhotos(
    postsData?.pages,
  );

  const allPhotosFlat = useMemo(() => photoPages.flat(), [photoPages]);

  const isInitialLoading =
    isLoadingPosts || (isProcessingPhotos && photoPages.length === 0);

  const isFetchingMore =
    isFetchingNextPage || (isProcessingPhotos && photoPages.length > 0);

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
