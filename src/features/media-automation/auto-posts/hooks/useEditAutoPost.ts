import { useLoading } from '@/contexts/Loading/useLoading';
import { useUploadPostMedias } from '@/features/post-management/hooks/useUploadPostMedias';
import { useSnackbar } from '@/hooks/useSnackbar';
import { projectKeys } from '@/lib/react-query/query-keys';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editAutoPost } from '../api/auto-posts.api';
import { AutoPost, AutoPostFormValues } from '../types';
import { autoPostKeys } from '../utils/autoPostKeys';

interface UseEditAutoPostOptions {
  onSuccess?: (editedAutoPost: AutoPost) => void;
  onError?: (errorMessage: string) => void;
  onSettled?: () => void;
}

export const useEditAutoPost = ({
  onSuccess,
  onError,
  onSettled,
}: UseEditAutoPostOptions = {}) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();
  const { handleUploadImageFile } = useUploadPostMedias();

  return useMutation({
    mutationFn: async ({ id, values }: EditAutoPostInput) => {
      let finalImageUrls = values.images
        .filter((img) => img.status === 'existing')
        .map((img) => img.url);

      const newImagesToUpload = values.images.filter(
        (image) => image.status === 'new' && image.file,
      );

      if (newImagesToUpload.length > 0) {
        const uploadedUrls = await Promise.all(
          newImagesToUpload.map((image) =>
            handleUploadImageFile(image.file!, `auto-post-${Date.now()}`),
          ),
        );

        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      return editAutoPost(id, {
        content: values.content,
        scheduledAt: values.scheduledAt ?? undefined,
        imageUrls: finalImageUrls,
      });
    },

    onMutate: (input: EditAutoPostInput) => {
      const message = input.id ? 'Saving changes...' : 'Creating post...';
      showLoading(message);
    },

    onSettled: () => {
      hideLoading();
      onSettled?.();
    },
    onSuccess: (editedAutoPost, input) => {
      queryClient.invalidateQueries({ queryKey: autoPostKeys.lists() });
      if (input.id) {
        queryClient.invalidateQueries({
          queryKey: autoPostKeys.details(input.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.all });

      const message = input.id
        ? 'Post updated successfully!'
        : 'Post created successfully!';
      showSnackbar(message, 'success');

      onSuccess?.(editedAutoPost);
    },

    onError: (error, input) => {
      const action = input.id ? 'update' : 'create';
      const message = extractApiErrorMessage(
        error,
        `Failed to ${action} post.`,
      );
      showSnackbar(message, 'error');
      onError?.(message);
    },
  });
};

export interface EditAutoPostInput {
  values: AutoPostFormValues;
  id: number;
}
