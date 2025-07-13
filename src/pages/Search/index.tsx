import TabPanel from '@/components/TabPanel';
import { a11yProps } from '@/components/TabPanel/util';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/contexts/SearchProvider';
import { Box, Tab, Tabs } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import { useSearchParams } from 'react-router-dom';
import PostSearchResults from './components/PostSearchResults';
import UserSearchResults from './components/UserSearchResults';

const Search = () => {
  const { query, setQuery } = useSearch();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<SearchTabValue>('posts');
  const [searchParams, setSearchParams] = useSearchParams();

  const finalQuery = query || searchParams.get('q');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputValue(q);
  }, [searchParams, setQuery]);

  const handleChangeTab = (
    _: React.SyntheticEvent,
    newValue: SearchTabValue,
  ) => {
    console.log('Tab changed to:', newValue);
    setTab(newValue);
    setQuery('');
    setInputValue('');
    setSearchParams(undefined);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-mountain-100 dark:bg-mountain-950 dark:border-mountain-800 flex h-fit w-full flex-col items-center justify-end space-y-2 space-x-4 border-b-1 bg-white pt-8">
        <p className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-medium text-transparent">
          Seek
        </p>
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-mountain-50 dark:bg-mountain-900 focus-within:text-mountain-950 dark:focus-within:text-mountain-50 relative flex h-14 w-168 items-center rounded-2xl text-neutral-700 dark:text-neutral-300">
            <FiSearch className="absolute left-2 h-5 w-5" />
            <Input
              ref={inputRef}
              className="placeholder:text-mountain-400 h-full w-full rounded-2xl border-none bg-transparent pr-8 pl-8 shadow-inner focus-visible:ring-0 focus-visible:ring-offset-0 md:text-lg"
              placeholder="Search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setQuery(inputValue);
                  inputRef.current?.blur();
                  setSearchParams({ q: inputValue });
                }
              }}
            />
            {inputValue.length > 0 && (
              <TiDeleteOutline
                className={`text-mountain-600 dark:text-mountain-400 absolute right-4 h-5 w-5 cursor-pointer`}
                onClick={() => {
                  setInputValue('');
                  setQuery('');

                  const newSearchParams = new URLSearchParams(searchParams);
                  newSearchParams.delete('q');
                  setSearchParams(newSearchParams);
                }}
              />
            )}
          </div>
        </div>
      </div>
      <Box className="z-50 mt-2 flex justify-center shadow-2xl">
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.1rem',
              fontWeight: 400,
            },
          }}
        >
          <Tab label="Posts" value="posts" {...a11yProps('posts')} />
          <Tab label="Users" value="users" {...a11yProps('users')} />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={'posts'}>
        <PostSearchResults finalQuery={tab === 'posts' ? finalQuery : null} />
      </TabPanel>
      <TabPanel value={tab} index={'users'}>
        <UserSearchResults searchQuery={tab === 'users' ? finalQuery : null} />
      </TabPanel>
    </div>
  );
};

export default memo(Search);

type SearchTabValue = 'posts' | 'users';
