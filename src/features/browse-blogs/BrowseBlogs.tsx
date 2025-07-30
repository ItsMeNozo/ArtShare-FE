import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { AiFillFire } from 'react-icons/ai';
import { FiSearch } from 'react-icons/fi';
import { IoHeartCircleOutline } from 'react-icons/io5';
import { TiDeleteOutline } from 'react-icons/ti';

import { InfiniteScroll } from '@/components/InfiniteScroll';
import BlogItem from '@/components/lists/BlogItem';
import { Input } from '@/components/ui/input';

import './BrowseBlogs.css';
import { useFetchBlogs } from './hooks/useFetchBlogs';
import { BlogTab } from './types';

const calculateReadingTime = (content: string): string => {
  const wordCount = content?.split(/\s+/).length ?? 0;
  return `${Math.ceil(wordCount / 200)}m reading`;
};

const BrowseBlogs: React.FC = () => {
  const [tab, setTab] = useState<BlogTab | null>('trending');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('accessToken');

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFetchBlogs({
    tab,
    searchQuery: tab ? null : searchQuery,
  });

  const publishedBlogs = useMemo(() => {
    const allBlogs = data?.pages.flatMap((page) => page.data) ?? [];
    // Filter out unpublished blogs
    return allBlogs.filter((blog) => blog.isPublished === true);
  }, [data]);

  const handleTabChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, val: string | null) => {
      if (!val) return;
      setTab(val as BlogTab);
    },
    [],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' || !searchInput) return;
      setSearchQuery(searchInput);
      setTab(null);
    },
    [searchInput],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setTab('trending');
  }, []);

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    [],
  );

  return (
    <div className="flex dark:bg-mountain-950 rounded-t-3xl h-screen overflow-hidden">
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="top-0 z-30 sticky bg-white dark:bg-mountain-900 shadow-sm p-4 border-mountain-200 dark:border-mountain-700 border-b-1">
          <div className="flex items-center space-x-4">
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                borderRadius: '9999px',
                gap: 2,
              }}
              className="bg-mountain-50 dark:bg-mountain-800 max-w-64"
            >
              <ToggleButtonGroup
                size="small"
                exclusive
                value={tab}
                onChange={handleTabChange}
                sx={TOGGLE_BUTTON_STYLES}
              >
                <ToggleButton
                  value="trending"
                  className="border border-mountain-200 w-32 dark:text-gray-300"
                >
                  <AiFillFire className="mr-1 size-4 dark:text-mountain-300" />
                  Trending
                </ToggleButton>
                {token && (
                  <ToggleButton
                    value="following"
                    className="border border-mountain-200 w-32 dark:text-gray-300"
                  >
                    <IoHeartCircleOutline className="mr-1 size-4 dark:text-mountain-300" />
                    Following
                  </ToggleButton>
                )}
              </ToggleButtonGroup>
            </Paper>

            <div className="relative flex flex-1 items-center">
              <FiSearch className="left-2 absolute w-5 h-5 text-gray-500 dark:text-gray-400" />
              <Input
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search"
                className="bg-mountain-50 dark:bg-mountain-800 shadow-inner pr-8 pl-8 border-gray-200 dark:border-mountain-700 rounded-2xl w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchInput && (
                <TiDeleteOutline
                  className="right-2 absolute w-5 h-5 text-mountain-600 hover:text-mountain-700 dark:hover:text-mountain-300 dark:text-mountain-400 cursor-pointer"
                  onClick={handleClearSearch}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 space-y-8 dark:bg-mountain-950 py-0 pb-24 min-h-screen overflow-auto custom-scrollbar">
          <InfiniteScroll
            data={publishedBlogs}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
            error={error}
            hasNextPage={!!hasNextPage}
            fetchNextPage={fetchNextPage}
          >
            <div className="flex flex-col gap-4 py-4 pr-4 overflow-hidden">
              {publishedBlogs.map((blog) => (
                <BlogItem
                  key={blog.id}
                  blogId={String(blog.id)}
                  title={blog.title}
                  content={blog.content}
                  thumbnail={
                    blog.pictures?.[0] ?? 'https://placehold.co/600x400'
                  }
                  author={{
                    username: blog.user.username,
                    avatar: blog.user.profilePictureUrl ?? '',
                  }}
                  category={blog.categories?.[0]?.name ?? ''}
                  timeReading={calculateReadingTime(blog.content)}
                  createdAt={blog.createdAt}
                  likeCount={blog.likeCount}
                  commentCount={blog.commentCount}
                  viewCount={blog.viewCount}
                />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default memo(BrowseBlogs);

const TOGGLE_BUTTON_STYLES = {
  gap: 1,
  '.MuiToggleButton-root': {
    border: 'none',
    borderRadius: '9999px',
    px: 2,
    textTransform: 'none',
    fontWeight: 500,
    backgroundColor: 'white',
  },
  '.MuiToggleButton-root.Mui-selected': {
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  },
};
