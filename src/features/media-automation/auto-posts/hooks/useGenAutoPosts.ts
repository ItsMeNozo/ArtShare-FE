import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { genAutoPosts } from '../api/auto-posts.api';
import { AutoPost } from '../types';
import { autoPostKeys } from '../utils/autoPostKeys';

interface UseGenAutoPostsOptions {
  onSuccess?: (genResponse: AutoPost[]) => void;
  onError?: (errorMessage: string) => void;
  onSettled?: () => void;
}

export const useGenAutoPosts = ({
  onSuccess,
  onError,
  onSettled,
}: UseGenAutoPostsOptions) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: async (input: GenAutoPostsInput) =>
      genAutoPosts({
        ...input,
      }),
    onMutate: () => {
      showLoading('Generating posts...');
    },
    onSettled: () => {
      hideLoading();
      onSettled?.();
    },
    onSuccess: (genResponse) => {
      queryClient.invalidateQueries({ queryKey: autoPostKeys.lists() });
      showSnackbar(
        `Generated ${genResponse.length} posts successfully!`,
        'success',
      );
      onSuccess?.(genResponse);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'Failed to generate posts due to an unexpected error.',
      );
      showSnackbar(message, 'error');
      onError?.(message);
    },
  });
};

export interface GenAutoPostsInput {
  autoProjectId: number;
  contentPrompt: string;
  postCount: number;
  toneOfVoice: string;
  wordCount: number;
  generateHashtag: boolean;
  includeEmojis: boolean;
}
