// src/features/user/hooks/useGetUserPosts.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUserPosts } from '../api/get-posts-by-user';

export function useGetUserPosts(username: string | undefined) {
  return useQuery({
    queryKey: ['posts', 'user', username],
    queryFn: async () => {
      if (!username) return [];
      return fetchUserPosts(username, 1);
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });
}
