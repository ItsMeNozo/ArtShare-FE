import { ImageRenderer } from '@/components/gallery/ImageRenderer';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { Button } from '@/components/ui/button';
import AttributeFilters from '@/features/explore/components/AttributeFilters';
import MediumFilters from '@/features/explore/components/MediumFilters';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { BsFilter } from 'react-icons/bs';
import { IoMdArrowDropdown } from 'react-icons/io';
import { TbCategory } from 'react-icons/tb';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import { useSearchPosts } from '../../hooks/useSearchPosts';

interface PostSearchResultsProps {
  finalQuery: string | null;
}

const PostSearchResults = ({ finalQuery }: PostSearchResultsProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isAi, setIsAi] = useState(false);

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
    enabled: !!finalQuery && finalQuery.length > 0,
  });

  const galleryPhotos = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.photos) ?? [];
  }, [postsData]);

  return (
    <Box className="relative flex h-screen flex-col p-2 pb-48">
      <div className="dark:bg-mountain-950 dark:border-mountain-800 absolute top-0 left-0 z-50 flex h-16 bg-white dark:border-b">
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
            <Box className="relative flex gap-2">
              <MediumFilters
                selectedMedium={selectedMedium}
                setSelectedMedium={setSelectedMedium}
              >
                {({ onClick }) => (
                  <Button
                    variant="outline"
                    className="dark:bg-mountain-900 hover:bg-mountain-50 dark:hover:bg-mountain-800 border-mountain-200 dark:border-mountain-700 text-mountain-950 dark:text-mountain-200 flex w-auto cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-1"
                    onClick={onClick}
                  >
                    <TbCategory size={16} className="mr-1" />
                    <p className="mr-1">Mediums</p>
                    <IoMdArrowDropdown />
                  </Button>
                )}
              </MediumFilters>
              <AttributeFilters
                selectedAttributes={selectedAttributes}
                setSelectedAttributes={setSelectedAttributes}
                isAi={isAi}
                setIsAi={setIsAi}
              >
                {({ onClick }) => (
                  <Button
                    variant="outline"
                    className="dark:bg-mountain-900 hover:bg-mountain-50 dark:hover:bg-mountain-800 border-mountain-200 dark:border-mountain-700 text-mountain-950 dark:text-mountain-200 flex w-auto cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-1"
                    onClick={onClick}
                  >
                    <TbCategory size={16} className="mr-1" />
                    <p className="mr-1">Attributes</p>
                    <IoMdArrowDropdown />
                  </Button>
                )}
              </AttributeFilters>
            </Box>
          )}
        </div>
        {/* Center - Tabs */}
      </div>

      {/* {selectedAttributes.length > 0 && (
        <div className="flex h-12 w-full items-center justify-center">
          <p className="text-mountain-400 dark:text-mountain-500 mr-2">
            Attributes:{' '}
          </p>
          <CategoryList
            selectedCategories={selectedAttributes}
            setSelectedCategories={setSelectedAttributes}
          />
        </div>
      )} */}
      {(selectedAttributes.length === 0 || selectedMedium) && (
        <div className="mb-2 flex h-12 w-full items-center justify-center">
          <div className="text-mountain-400 dark:text-mountain-500">
            Tips: Want more specific results? Try adding filters.
          </div>
        </div>
      )}
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
          spacing={8}
          targetRowHeight={256}
          rowConstraints={{ singleRowMaxHeight: 256 }}
          render={{ image: ImageRenderer }}
        />
      </InfiniteScroll>
    </Box>
  );
};

export default PostSearchResults;
