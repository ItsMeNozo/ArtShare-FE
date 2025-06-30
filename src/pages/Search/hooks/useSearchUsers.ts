import { useInfiniteQuery } from "@tanstack/react-query";
import { searchUsers } from "../api/searchUsers.api";

interface UserSearchUsersParams {
  searchQuery: string;
  enabled?: boolean;
}

export const useSearchUsers = (params: UserSearchUsersParams) => {
  const { searchQuery, enabled = true } = params;

  return useInfiniteQuery({
    queryKey: ["userSearch", searchQuery],

    queryFn: ({ pageParam = 1 }) =>
      searchUsers({ search: searchQuery, page: pageParam }),

    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },

    initialPageParam: 1,
    staleTime: 0,
    // staleTime: 1000 * 60 * 3,
    enabled,
  });
};
