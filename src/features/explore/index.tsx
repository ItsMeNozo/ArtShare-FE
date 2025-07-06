import { ImageRenderer } from '@/components/gallery/ImageRenderer';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { memo, useMemo, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import FilterBar from './components/FilterBar';
import { useGetPosts } from './hooks/useGetPosts';
import { ExploreTab } from './types';

const Explore: React.FC = () => {
  const [tab, setTab] = useState<ExploreTab>('Trending');
  const [selectedCategories, setSelectedCategories] = useState<string | null>(
    null,
  );
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);

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
    attributes: [],
    mediums: selectedMediums,
    isAi: false,
    isMature: false,
  });

  const handleTabChange = (
    _: React.MouseEvent<HTMLElement>,
    newTab: ExploreTab,
  ) => {
    if (newTab) setTab(newTab);
  };

  const galleryPhotos = useMemo(() => {
    return postsData?.pages.flatMap((page) => page.photos) ?? [];
  }, [postsData]);

  return (
    <div className="relative flex flex-col h-screen min-h-0">
      <div className="z-10 sticky flex flex-col bg-gradient-to-t dark:bg-gradient-to-t from-white dark:from-mountain-1000 to-mountain-50 dark:to-mountain-950 px-4 py-1 rounded-t-3xl">
        <FilterBar
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedMediums={selectedMediums}
          setSelectedMediums={setSelectedMediums}
        />
      </div>
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
      <Paper className="bottom-4 left-1/2 z-50 fixed bg-white dark:bg-mountain-800 shadow-lg rounded-full transform">
        <ToggleButtonGroup
          className="flex gap-2 m-1.5"
          size="small"
          value={tab}
          exclusive
          onChange={handleTabChange}
          aria-label="Filter posts"
        >
          <ToggleButton
            color="primary"
            className="data-[selected]:dark:bg-primary-700 -m-0.5 px-4 py-2 border-0 rounded-full data-[selected]:dark:text-white dark:text-mountain-100 normal-case"
            value={'Trending' as ExploreTab}
          >
            Trending
          </ToggleButton>
          <ToggleButton
            color="primary"
            className="data-[selected]:dark:bg-primary-700 -m-0.5 px-4 py-2 border-0 rounded-full data-[selected]:dark:text-white dark:text-mountain-100 normal-case"
            value={'Following' as ExploreTab}
          >
            Following
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </div>
  );
};

export default memo(Explore);
