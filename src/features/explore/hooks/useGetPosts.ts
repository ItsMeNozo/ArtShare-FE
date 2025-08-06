import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api/get-post';
import { ExploreTab } from '../types';

interface UseGetPostOptions {
  tab: ExploreTab;
  mediums?: string[];
  attribute?: string | null;
  isAi?: boolean;
  enabled?: boolean;
}

export function useGetPosts({
  tab,
  mediums = [],
  attribute,
  isAi = false,
  enabled = true,
}: UseGetPostOptions) {
  return useInfiniteQuery({
    queryKey: ['posts', 'list', tab, mediums, attribute, isAi],
    queryFn: async ({ pageParam = 1 }) => {
      const tabParam = tab === 'Trending' ? 'trending' : 'following';
      const filterParams: string[] = mediums.concat(
        attribute ? [attribute] : [],
      );

      const apiResponse = await getPosts(tabParam, {
        page: pageParam,
        filter: filterParams,
        isAi,
        limit: 10,
      });

      return apiResponse;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
