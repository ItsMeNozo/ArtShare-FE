import { postKeys } from '@/lib/react-query/query-keys';
import { useQuery } from '@tanstack/react-query';
import { fetchPost } from '../api/post.api';

export const useGetPostDetails = (postId?: string | number) => {
  const numericPostId = postId ? Number(postId) : NaN;
  // The `enabled` flag prevents this from running with an invalid ID
  const isEnabled = !!postId && !isNaN(numericPostId);

  return useQuery({
    queryKey: postKeys.details(numericPostId),

    queryFn: async () => {
      const response = await fetchPost(numericPostId);
      return response.data;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });
};
