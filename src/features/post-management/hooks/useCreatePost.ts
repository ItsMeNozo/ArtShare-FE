import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/post"; // Assuming you have a Post type

// API functions (assuming these are defined elsewhere)
import { PostMedia } from "../types/post-media";
import { PostFormValues } from "../types/post-form-values.type";
import {
  createFormData,
  getImageFilesFromPostMedias,
  getVideoFileFromPostMedias,
} from "../helpers/upload-post.helper";
import { createPost } from "../api/create-post";
import { useLoading } from "@/contexts/Loading/useLoading";
import { extractApiErrorMessage } from "@/utils/error.util";
import { postKeys } from "@/lib/react-query/query-keys";
import { useUploadPostMedias } from "./useUploadPostMedias";

interface CreatePostVariables {
  values: PostFormValues;
  postMedias: PostMedia[];
  thumbnail: PostMedia;
  originalThumbnail: PostMedia;
  hasArtNovaImages: boolean;
  promptId: number | null;
}

interface UseCreatePostOptions {
  onSuccess?: (createdPost: Post) => void;
  onError?: (errorMessage: string) => void;
  onSettled?: () => void;
}

export const useCreatePost = (options: UseCreatePostOptions) => {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoading();
  const { handleUploadVideo, handleUploadImageFile } = useUploadPostMedias();

  return useMutation<Post, Error, CreatePostVariables>({
    mutationFn: async (variables: CreatePostVariables): Promise<Post> => {
      const {
        values,
        postMedias,
        thumbnail,
        originalThumbnail,
        hasArtNovaImages,
        promptId,
      } = variables;

      const videoFile = getVideoFileFromPostMedias(postMedias);

      // --- async upload medias ---
      const [videoUrl, initialThumbnailUrl, thumbnailUrl] = await Promise.all([
        videoFile && handleUploadVideo(videoFile),
        handleUploadImageFile(originalThumbnail.file, "original_thumbnail"),
        handleUploadImageFile(thumbnail.file, "thumbnail"),
      ] as Promise<string | undefined>[]);

      // Create the form data
      const formData = createFormData({
        title: values.title,
        thumbnailUrl: thumbnailUrl!,
        thumbnailCropMeta: JSON.stringify(values.thumbnailMeta),
        description: values.description,
        imageFiles: getImageFilesFromPostMedias(postMedias),
        videoUrl,
        initialThumbnailUrl,
        isMature: values.isMature,
        aiCreated: hasArtNovaImages,
        cate_ids: values.cate_ids,
        prompt_id: promptId ?? undefined,
      });

      const response = await createPost(formData);
      return response.data;
    },

    onMutate: () => showLoading("Creating your post..."),
    onSettled: () => {
      hideLoading();

      options.onSettled?.();
    },

    onSuccess: (createdPost) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });

      options?.onSuccess?.(createdPost);
    },

    onError: (error) => {
      const message = extractApiErrorMessage(error, "Failed to create post.");
      options.onError?.(message);
    },
  });
};
