import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { memo, useMemo, useState } from 'react';
import { AiFillFire } from 'react-icons/ai';
import { FiSearch } from 'react-icons/fi';
import { IoHeartCircleOutline } from 'react-icons/io5';
import { TiDeleteOutline } from 'react-icons/ti';

import BlogItem from '@/components/lists/BlogItem';
import { Input } from '@/components/ui/input';

import { InfiniteScroll } from '@/components/InfiniteScroll';
import './BrowseBlogs.css';
import { useFetchBlogs } from './hooks/useFetchBlogs';
import { BlogTab } from './types';

const BrowseBlogs: React.FC = () => {
  const [tab, setTab] = useState<BlogTab | null>('trending');

  const [searchInput, setSearchInput] = useState('');
  const [searcQuery, setSearchQuery] = useState('');

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
    searchQuery: tab ? null : searcQuery,
  });

  const allBlogs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  console.log('allBlogs', allBlogs, data);

  const handleTabChange = (
    _: React.MouseEvent<HTMLElement>,
    val: string | null,
  ) => {
    if (!val) return;
    setTab(val as BlogTab);
  };

  return (
    <div className="dark:bg-mountain-950 flex h-screen overflow-hidden rounded-t-3xl">
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="dark:bg-mountain-900 border-mountain-200 dark:border-mountain-700 sticky top-0 z-30 border-b-1 bg-white p-4 shadow-sm">
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
              className="bg-mountain-50 dark:bg-mountain-800 w-64"
            >
              <ToggleButtonGroup
                size="small"
                exclusive
                value={tab}
                onChange={handleTabChange}
                sx={{
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
                }}
              >
                <ToggleButton
                  value="trending"
                  className="border-mountain-200 w-32 border dark:text-gray-300"
                >
                  <AiFillFire className="dark:text-mountain-300 mr-1 size-4" />
                  Trending
                </ToggleButton>
                <ToggleButton
                  value="following"
                  className="border-mountain-200 w-32 border dark:text-gray-300"
                >
                  <IoHeartCircleOutline className="dark:text-mountain-300 mr-1 size-4" />
                  Following
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>
            <div className="relative flex flex-1 items-center">
              <FiSearch className="absolute left-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' || !searchInput) return;
                  setSearchQuery(searchInput);
                  setTab(null);
                }}
                placeholder="Search"
                className="bg-mountain-50 dark:bg-mountain-800 dark:border-mountain-700 w-full rounded-2xl border-gray-200 pr-8 pl-8 text-gray-900 placeholder-gray-500 shadow-inner dark:text-gray-100 dark:placeholder-gray-400"
              />
              <TiDeleteOutline
                className={`text-mountain-600 dark:text-mountain-400 hover:text-mountain-700 dark:hover:text-mountain-300 absolute right-2 h-5 w-5 cursor-pointer ${
                  searchInput ? 'block' : 'hidden'
                }`}
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setTab('trending');
                }}
              />
            </div>
          </div>
        </div>
        <div className="dark:bg-mountain-950 sidebar flex min-h-screen flex-col gap-4 space-y-8 overflow-auto py-0 pb-24 pl-4">
          <InfiniteScroll
            data={allBlogs}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
            error={error}
            hasNextPage={!!hasNextPage}
            fetchNextPage={fetchNextPage}
          >
            <div className="flex flex-col gap-4 overflow-hidden py-4 pr-4">
              {allBlogs.map((b) => (
                <BlogItem
                  key={b.id}
                  blogId={String(b.id)}
                  title={b.title}
                  // ... rest of your BlogItem props
                  content={b.content}
                  thumbnail={b.pictures?.[0] ?? 'https://placehold.co/600x400'}
                  author={{
                    username: b.user.username,
                    avatar: b.user.profilePictureUrl ?? '',
                  }}
                  category={b.categories?.[0]?.name ?? ''}
                  timeReading={`${Math.ceil((b.content?.split(/\s+/).length ?? 0) / 200)}m reading`}
                  createdAt={b.createdAt}
                  likeCount={b.likeCount}
                  commentCount={b.commentCount}
                  viewCount={b.viewCount}
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
