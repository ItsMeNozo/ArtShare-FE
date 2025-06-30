import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api/get-post';
import { ExploreTab } from '../types';
import { postsToPhotos } from '../utils';

interface UseGetPostOptions {
  tab: ExploreTab;
  attributes?: string[];
  mediums?: string[];
  isAi?: boolean;
  isMature?: boolean;
  enabled?: boolean;
}

export function useGetPosts({
  tab,
  attributes = [],
  mediums = [],
  isAi = false,
  isMature = false,
  enabled = true,
}: UseGetPostOptions) {
  return useInfiniteQuery({
    queryKey: ['posts', 'list', tab, attributes, mediums, isAi, isMature],
    queryFn: async ({ pageParam = 1 }) => {
      const tabParam = tab === 'Trending' ? 'trending' : 'following';
      const filterParams: string[] = mediums.concat(attributes);

      const apiResponse = await getPosts(tabParam, {
        page: pageParam,
        filter: filterParams,
        isAi,
        isMature,
      });

      return postsToPhotos(apiResponse);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    // staleTime: 1000 * 60 * 5,
    enabled,
  });
}
