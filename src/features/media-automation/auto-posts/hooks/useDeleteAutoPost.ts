import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { projectKeys } from '@/lib/react-query/query-keys';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAutoPost } from '../api/auto-posts.api';
import { autoPostKeys } from '../utils/autoPostKeys';

interface UseDeleteAutoPostOptions {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  projectId?: number; // Add project ID to invalidate project queries
}

export const useDeleteAutoPost = ({
  onSuccess,
  onError,
  projectId,
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

      // If project ID is provided, also invalidate project details to refresh post count
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.details(projectId),
        });
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      }

      onSuccess?.();
    },

    onError: (error) => {
      const message = extractApiErrorMessage(error, 'Failed to delete post.');
      showSnackbar(message, 'error');
      onError?.(message);
    },
  });
};
