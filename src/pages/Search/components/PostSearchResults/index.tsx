import CategoryList from '@/components/filters/Filter';
import { ImageRenderer } from '@/components/gallery/ImageRenderer';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { BsFilter } from 'react-icons/bs';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import useMeasure from 'react-use-measure';
import { useSearchPosts } from '../../hooks/useSearchPosts';
import MediumFilters from './MediumFilters';

interface PostSearchResultsProps {
  finalQuery: string | null;
}

const PostSearchResults = ({ finalQuery }: PostSearchResultsProps) => {
  const [ref, { width }] = useMeasure();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);

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
    selectedMediums,
    enabled: !!finalQuery && finalQuery.length > 0,
  });

  const galleryPhotos = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.photos) ?? [];
  }, [postsData]);

  return (
    <Box className="relative flex h-screen flex-col p-2 pb-48">
      <div
        ref={ref}
        className="dark:bg-mountain-950 dark:border-mountain-800 absolute top-0 left-0 z-50 flex h-16 bg-white dark:border-b"
      >
        {/* Left side - Filter */}
        <div className="absolute top-1/2 left-4 flex -translate-y-1/2 transform items-center space-x-4">
          <div
            className={`hover:bg-mountain-50 dark:hover:bg-mountain-900 flex items-center space-x-2 rounded-lg px-2 py-1 hover:cursor-pointer ${
              showFilters
                ? 'text-mountain-950 dark:text-mountain-50 font-medium'
                : 'text-mountain-600 dark:text-mountain-400 font-normal'
            }`}
            onClick={() => {
              setShowFilters((prev) => !prev);
            }}
          >
            <BsFilter size={16} />
            <p>Filter</p>
          </div>

          {showFilters && (
            <MediumFilters
              selectedMediums={selectedMediums}
              setSelectedMediums={setSelectedMediums}
            />
          )}
        </div>
        {/* Center - Tabs */}
      </div>

      {selectedMediums.length > 0 && (
        <div className="flex h-12 w-full items-center justify-center">
          <p className="text-mountain-400 dark:text-mountain-500 mr-2">
            Mediums:{' '}
          </p>
          <CategoryList
            selectedCategories={selectedMediums}
            setSelectedCategories={setSelectedMediums}
          />
        </div>
      )}
      {selectedMediums.length === 0 && (
        <div className="flex h-12 w-full items-center justify-center">
          <div className="text-mountain-400 dark:text-mountain-500">
            Tips: Want more specific results? Try adding a channel filter.
          </div>
        </div>
      )}
      {width > 0 && (
        <InfiniteScroll
          data={galleryPhotos}
          isLoading={isLoadingPosts}
          isFetchingNextPage={isFetchingNextPage}
          isError={isPostsError}
          error={postsError}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        >
          <RowsPhotoAlbum
            photos={galleryPhotos}
            defaultContainerWidth={width}
            spacing={8}
            targetRowHeight={256}
            rowConstraints={{ singleRowMaxHeight: 256 }}
            render={{ image: ImageRenderer }}
          />
        </InfiniteScroll>
      )}
    </Box>
  );
};

export default PostSearchResults;
