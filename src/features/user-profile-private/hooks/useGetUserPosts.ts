// src/features/user/hooks/useGetUserPosts.ts
import { postKeys } from '@/lib/react-query/query-keys';
import { useQuery } from '@tanstack/react-query';
import { fetchUserPosts } from '../api/get-posts-by-user';

export function useGetUserPosts(username: string | undefined) {
  return useQuery({
    queryKey: postKeys.userPosts(username!),
    queryFn: async () => {
      if (!username) return [];
      return fetchUserPosts(username, 1, 50); // Increased page size to reduce API calls
    },
    enabled: !!username,
    staleTime: 0, // Consider data stale immediately to ensure fresh data after deletions
    gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce unnecessary requests
    refetchOnMount: true, // Allow refetch on mount to get fresh data after cache invalidation
    retry: 1, // Reduce retry attempts for faster failure
    networkMode: 'online', // Only fetch when online
  });
}
