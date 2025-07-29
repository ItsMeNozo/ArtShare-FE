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

  const photos = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.data) ?? [];
  }, [postsData]);

  const { galleryPhotos, isProcessing: isProcessingPhotos } =
    useGalleryPhotos(photos);

  if (isProcessingPhotos) {
    return <></>;
  }

  return (
    <IGallery
      photos={galleryPhotos}
      isLoading={isLoadingPosts}
      isFetchingNextPage={isFetchingNextPage}
      isError={isPostsError}
      error={postsError}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};
