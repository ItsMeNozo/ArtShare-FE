import { searchPosts } from '@/features/explore/api/get-post';
import { postsToPhotos } from '@/features/explore/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseSearchPostsParams {
  finalQuery: string | null;
  medium?: string | null;
  attributes?: string[];
  isAi?: boolean;
  enabled?: boolean;
}

export const useSearchPosts = (params: UseSearchPostsParams) => {
  const { finalQuery, medium, attributes = [], isAi, enabled = true } = params;

  return useInfiniteQuery({
    queryKey: ['postSearch', finalQuery, medium, attributes, isAi],

    queryFn: async ({ pageParam = 1 }) => {
      const filter = attributes.concat(medium ? [medium] : []);

      const apiResponse = await searchPosts({
        page: pageParam,
        q: finalQuery!,
        filter,
        isAi,
      });

      return postsToPhotos(apiResponse);
    },

    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },

    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    enabled: !!finalQuery && enabled && finalQuery.trim() !== '',
  });
};
