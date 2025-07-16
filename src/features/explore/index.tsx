import { ImageRenderer } from '@/components/gallery/ImageRenderer';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { memo, useMemo, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import { useNavigate } from 'react-router-dom';
import useMeasure from 'react-use-measure';
import FilterBar from './components/FilterBar';
import { useGetPosts } from './hooks/useGetPosts';
import { ExploreTab } from './types';

const Explore: React.FC = () => {
  const [ref, { width }] = useMeasure();
  const [tab, setTab] = useState<ExploreTab>('Trending');
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isAi, setIsAi] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const handlePhotoClick = (photoId: number) => {
    navigate(`/posts/${photoId}`);
  };

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
    medium: selectedMedium,
    isAi,
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
    <div ref={ref} className="relative flex flex-col h-screen min-h-0">
      <div className="z-10 sticky flex flex-col gap-4 bg-gradient-to-t dark:bg-gradient-to-t from-white dark:from-mountain-1000 to-mountain-50 dark:to-mountain-950 px-4 py-1 pt-3 rounded-t-3xl">
        <FilterBar
          selectedMedium={selectedMedium}
          setSelectedMedium={setSelectedMedium}
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
          isAi={isAi}
          setIsAi={setIsAi}
        />
      </div>
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
            onClick={({ photo }) => handlePhotoClick(photo.postId)}
          />
        </InfiniteScroll>
      )}

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
          {token && (
            <ToggleButton
              color="primary"
              className="data-[selected]:dark:bg-primary-700 -m-0.5 px-4 py-2 border-0 rounded-full data-[selected]:dark:text-white dark:text-mountain-100 normal-case"
              value={'Following' as ExploreTab}
            >
              Following
            </ToggleButton>
          )}
        </ToggleButtonGroup>
      </Paper>
    </div>
  );
};

export default memo(Explore);
