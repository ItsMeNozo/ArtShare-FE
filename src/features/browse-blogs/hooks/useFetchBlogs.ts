import { blogKeys } from '@/lib/react-query/query-keys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBlogs } from '../api/fetch-blogs.api';
import { searchBlogs } from '../api/search-blogs.api';
import { BlogTab } from '../types';

interface FetchBlogsParams {
  tab: BlogTab | null;
  searchQuery: string | null;
}

export function useFetchBlogs({ tab, searchQuery }: FetchBlogsParams) {
  return useInfiniteQuery({
    queryKey: searchQuery
      ? blogKeys.search(searchQuery)
      : blogKeys.list({ tab }),
    queryFn: ({ pageParam = 1 }) => {
      if (searchQuery) {
        return searchBlogs({
          search: searchQuery,
          page: pageParam,
        });
      }
      if (!tab) {
        throw new Error('Tab is required when not searching');
      }
      return fetchBlogs(tab, { page: pageParam });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 3,
    // staleTime: 0,
    enabled: !!tab || !!searchQuery,
  });
}
