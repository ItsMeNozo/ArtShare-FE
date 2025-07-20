import IGallery from '@/components/gallery/Gallery';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import React, { useMemo } from 'react';
import { useSearchPosts } from '../../hooks/useSearchPosts';

interface PostSearchResultsGalleryProps {
  finalQuery: string | null;
  selectedMedium: string | null;
  selectedAttributes: string[];
  isAi: boolean;
}

export const PostSearchResultsGallery: React.FC<
  PostSearchResultsGalleryProps
> = ({ finalQuery, selectedMedium, selectedAttributes, isAi }) => {
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
    medium: selectedMedium,
    attributes: selectedAttributes,
    isAi,
    enabled: !!finalQuery && finalQuery.length > 0,
  });

  const posts = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.data) ?? [];
  }, [postsData]);

  const { galleryPhotos, isProcessing: isProcessingPhotos } =
    useGalleryPhotos(posts);

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
