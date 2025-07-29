import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api/get-post';
import { ExploreTab } from '../types';
import { postsToPhotos } from '../utils';

interface UseGetPostOptions {
  tab: ExploreTab;
  attributes?: string[];
  medium?: string | null;
  isAi?: boolean;
  enabled?: boolean;
}

export function useGetPosts({
  tab,
  attributes = [],
  medium,
  isAi = false,
  enabled = true,
}: UseGetPostOptions) {
  return useInfiniteQuery({
    queryKey: ['posts', 'list', tab, attributes, medium, isAi],
    queryFn: async ({ pageParam = 1 }) => {
      const tabParam = tab === 'Trending' ? 'trending' : 'following';
      const filterParams: string[] = attributes.concat(medium ? [medium] : []);

      const apiResponse = await getPosts(tabParam, {
        page: pageParam,
        filter: filterParams,
        isAi,
      });
      return postsToPhotos(apiResponse);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
