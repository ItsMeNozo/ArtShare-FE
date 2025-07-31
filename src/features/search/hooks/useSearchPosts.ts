import { searchPosts } from '@/features/explore/api/get-post';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseSearchPostsParams {
  finalQuery: string | null;
  attribute?: string | null;
  mediums?: string[];
  isAi?: boolean;
  enabled?: boolean;
}

export const useSearchPosts = (params: UseSearchPostsParams) => {
  const { finalQuery, attribute, mediums = [], isAi, enabled = true } = params;

  return useInfiniteQuery({
    queryKey: ['postSearch', finalQuery, attribute, mediums, isAi],

    queryFn: async ({ pageParam = 1 }) => {
      const filter = mediums.concat(attribute ? [attribute] : []);

      const apiResponse = await searchPosts({
        page: pageParam,
        q: finalQuery!,
        filter,
        isAi,
      });

      return apiResponse;
    },

    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },

    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    enabled: !!finalQuery && enabled && finalQuery.trim() !== '',
  });
};
