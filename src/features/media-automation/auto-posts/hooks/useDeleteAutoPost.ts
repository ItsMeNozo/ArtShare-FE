import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAutoPost } from '../api/auto-posts.api';
import { autoPostKeys } from '../utils/autoPostKeys';

interface UseDeleteAutoPostOptions {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

export const useDeleteAutoPost = ({
  onSuccess,
  onError,
}: UseDeleteAutoPostOptions = {}) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: (autoPostId: number) => deleteAutoPost(autoPostId),

    onMutate: () => {
      showLoading('Deleting post...');
    },

    onSettled: () => {
      hideLoading();
    },

    onSuccess: (_, autoPostId) => {
      showSnackbar('Post deleted successfully!', 'success');

      queryClient.invalidateQueries({ queryKey: autoPostKeys.lists() });

      queryClient.removeQueries({ queryKey: autoPostKeys.details(autoPostId) });

      onSuccess?.();
    },

    onError: (error) => {
      const message = extractApiErrorMessage(error, 'Failed to delete post.');
      showSnackbar(message, 'error');
      onError?.(message);
    },
  });
};
