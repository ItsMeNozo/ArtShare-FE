import { userKeys } from '@/lib/react-query/query-keys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchUsers } from '../api/searchUsers.api';
import { usersToPhotos } from '../utils/transformUserToPhoto';

interface UserSearchUsersParams {
  searchQuery: string;
  enabled?: boolean;
}

export const useSearchUsers = (params: UserSearchUsersParams) => {
  const { searchQuery, enabled = true } = params;

  return useInfiniteQuery({
    queryKey: userKeys.search(searchQuery),

    queryFn: async ({ pageParam = 1 }) => {
      const apiResponse = await searchUsers({
        search: searchQuery,
        page: pageParam,
      });

      console.log('useSearchUsers apiResponse:', apiResponse);

      return usersToPhotos(apiResponse);
    },

    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },

    initialPageParam: 1,
    staleTime: 0,
    // staleTime: 1000 * 60 * 3,
    enabled,
  });
};
