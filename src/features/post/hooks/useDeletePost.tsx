import { deletePost } from '@/api/post/post';
import { useLoading } from '@/contexts/Loading/useLoading';
import { postKeys } from '@/lib/react-query/query-keys';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type UseDeletePostOptions = {
  username?: string;
  onSuccess?: (postId: number) => void;
  onError?: (errorMessage: string) => void;
};

export const useDeletePost = (options: UseDeletePostOptions = {}) => {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: deletePost,

    onMutate: async (postId) => {
      showLoading('Deleting post...');

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      return { postId };
    },

    onSettled: () => {
      hideLoading();
    },

    onSuccess: (_, postId) => {
      console.log(`[useDeletePost] Post ${postId} deleted successfully!`);

      // Remove the specific post details from cache immediately
      queryClient.removeQueries({ queryKey: postKeys.details(postId) });

      // Invalidate all post-related queries to ensure fresh data everywhere
      queryClient.invalidateQueries({
        queryKey: postKeys.all,
        refetchType: 'active',
      });

      options.onSuccess?.(postId);
    },

    onError: (error, _postId, _context) => {
      console.error('Error deleting post:', error);

      // Invalidate queries to ensure data consistency even on error
      queryClient.invalidateQueries({
        queryKey: postKeys.all,
        refetchType: 'active',
      });

      if (options.onError) {
        const displayMessage = extractApiErrorMessage(
          error,
          'Failed to delete post. Please try again.',
        );
        options.onError(displayMessage);
      }
    },
  });
};
