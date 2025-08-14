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
    <div className="flex flex-col h-screen overflow-y-auto custom-scrollbar">
      <div className="flex flex-col justify-end items-center space-x-4 space-y-2 bg-white dark:bg-mountain-950 pt-8 border-mountain-100 dark:border-mountain-800 border-b-1 rounded-t-3xl w-full h-fit">
        <p className="inline-block bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-medium text-transparent text-3xl">
          Seek
        </p>
        <div className="flex justify-center items-center mb-6">
          <div className="relative flex items-center dark:bg-mountain-900 rounded-2xl w-168 h-14 text-neutral-700 focus-within:text-mountain-950 dark:focus-within:text-mountain-50 dark:text-neutral-300">
            <FiSearch className="left-2 absolute w-5 h-5" />
            <Input
              ref={inputRef}
              className="bg-mountain-50 shadow-inner pr-8 pl-8 border-none rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 w-full h-full placeholder:text-mountain-400 md:text-lg"
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
      <Box className="z-50 flex justify-center mt-2 border-mountain-200 border-b-1">
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.1rem',
              fontWeight: 400,
            },
            backgroundColor: '#F2F4F7'
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
