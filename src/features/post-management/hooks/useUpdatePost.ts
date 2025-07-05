import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUploadPostMedias } from './useUploadPostMedias';

import { useLoading } from '@/contexts/Loading/useLoading';
import { postKeys } from '@/lib/react-query/query-keys';
import { Post } from '@/types';
import { extractApiErrorMessage } from '@/utils/error.util';
import { updatePost } from '../api/update-post';
import {
  createFormDataForEdit,
  getImageUrlsToRetain,
  getNewImageFiles,
  getNewlyUploadedRequiredFile,
  getNewVideoFile,
} from '../helpers/edit-post.helper';
import { PostFormValues } from '../types/post-form-values.type';
import { PostMedia } from '../types/post-media';

interface UpdatePostVariables {
  postId: number;
  values: PostFormValues;
  postMedias: PostMedia[];
  thumbnail: PostMedia;
  originalThumbnail: PostMedia;
  hasArtNovaImages: boolean;
  fetchedPost: Post;
}

interface UseUpdatePostOptions {
  onSuccess?: (updatedPost: Post) => void;
  onError?: (errorMessage: string) => void;
}

export const useUpdatePost = (options: UseUpdatePostOptions) => {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();
  const { handleUploadVideo, handleUploadImageFile } = useUploadPostMedias();

  const updatePostMutationFn = async (
    variables: UpdatePostVariables,
  ): Promise<Post> => {
    const {
      postId,
      values,
      postMedias,
      thumbnail,
      originalThumbnail,
      hasArtNovaImages,
      fetchedPost,
    } = variables;

    // --- All async logic from the old handleSubmit is now here ---
    const videoMedia = postMedias.find((media) => media.type === 'video');
    const newVideoFile = getNewVideoFile(videoMedia);
    const newThumbnailFile = getNewlyUploadedRequiredFile(thumbnail);
    const newOriginalThumbnailFile =
      getNewlyUploadedRequiredFile(originalThumbnail);

    const [newVideoUrl, newInitialThumbnailUrl, newThumbnailUrl] =
      await Promise.all([
        newVideoFile
          ? handleUploadVideo(newVideoFile)
          : Promise.resolve(undefined),
        newOriginalThumbnailFile
          ? handleUploadImageFile(
              newOriginalThumbnailFile,
              'original_thumbnail',
            )
          : Promise.resolve(undefined),
        newThumbnailFile
          ? handleUploadImageFile(newThumbnailFile, 'thumbnail')
          : Promise.resolve(undefined),
      ]);

    const imageMedias = postMedias.filter((media) => media.type === 'image');

    const body = createFormDataForEdit({
      title: values.title,
      imageUrlsToRetain: getImageUrlsToRetain(imageMedias),
      newImageFiles: getNewImageFiles(imageMedias),
      categoryIds: values.categoryIds,
      thumbnailCropMeta: JSON.stringify(values.thumbnailMeta),
      description: values.description,
      videoUrl: newVideoUrl !== undefined ? newVideoUrl : videoMedia?.url,
      initialThumbnail:
        newInitialThumbnailUrl ??
        fetchedPost.thumbnailCropMeta.initialThumbnail,
      thumbnailUrl: newThumbnailUrl,
      isMature: values.isMature,
      aiCreated: hasArtNovaImages,
    });

    const response = await updatePost(postId, body);
    return response.data;
  };

  return useMutation<Post, Error, UpdatePostVariables>({
    mutationFn: updatePostMutationFn,
    onMutate: () => showLoading('Updating post...'),
    onSettled: () => hideLoading(),

    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({
        queryKey: postKeys.details(updatedPost.id),
      });
      queryClient.invalidateQueries({
        queryKey: postKeys.all,
      });

      options.onSuccess?.(updatedPost);
    },

    onError: (error) => {
      const message = extractApiErrorMessage(error, 'Failed to update post');
      options?.onError?.(message);
    },
  });
};
