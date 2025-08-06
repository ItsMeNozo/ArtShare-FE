import { deletePost } from '@/api/post/post';
import { useLoading } from '@/contexts/Loading/useLoading';
import { Post } from '@/types';
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

    onMutate: () => {
      showLoading('Deleting post...');
    },

    onSettled: () => {
      hideLoading();
    },

    onSuccess: (_, postId) => {
      console.log('Post deleted successfully!');

      if (options.username) {
        const userPostsQueryKey = ['posts', 'user', options.username];

        queryClient.setQueryData<Post[]>(userPostsQueryKey, (oldData) => {
          if (!oldData) return [];
          return oldData.filter((post) => post.id !== postId);
        });
      }

      queryClient.invalidateQueries({ queryKey: ['posts'] });

      queryClient.removeQueries({ queryKey: ['postDetails', postId] });

      options.onSuccess?.(postId);
    },

    onError: (error) => {
      console.error('Error deleting post:', error);
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
