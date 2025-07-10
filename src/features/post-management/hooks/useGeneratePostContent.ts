import { useLoading } from '@/contexts/Loading/useLoading';
import { subscriptionKeys } from '@/lib/react-query/query-keys';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  generatePostContent,
  GeneratePostContentResponse,
} from '../api/generate-post-content.api';

interface UseGeneratePostContentOptions {
  onSuccess?: (data: GeneratePostContentResponse) => void;
  onError?: (errorMessage: string) => void;
}

export const useGeneratePostContent = (
  options?: UseGeneratePostContentOptions,
) => {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();

  return useMutation<GeneratePostContentResponse, Error, FormData>({
    mutationFn: generatePostContent,
    onMutate: () => showLoading('Generating...'),

    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },

    onError: (error) => {
      const message = extractApiErrorMessage(error, 'Error generating content');
      options?.onError?.(message);
    },

    onSettled: () => {
      hideLoading();

      queryClient.invalidateQueries({ queryKey: subscriptionKeys.info });
    },
  });
};
