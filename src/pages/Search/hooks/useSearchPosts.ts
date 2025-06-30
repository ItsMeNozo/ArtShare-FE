import { searchPosts } from '@/features/explore/api/get-post';
import { postsToPhotos } from '@/features/explore/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseSearchPostsParams {
  finalQuery: string | null;
  selectedMediums?: string[];
  enabled?: boolean;
}

export const useSearchPosts = (params: UseSearchPostsParams) => {
  const { finalQuery, selectedMediums, enabled = true } = params;

  return useInfiniteQuery({
    queryKey: ['postSearch', finalQuery, selectedMediums],

    queryFn: async ({ pageParam = 1 }) => {
      const apiResponse = await searchPosts({
        page: pageParam,
        q: finalQuery!,
        // filter: selectedMediums,
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
