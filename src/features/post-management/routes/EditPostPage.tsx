import Loading from '@/components/loading/Loading';
import { useGetPostDetails } from '@/features/post/hooks/useGetPostDetails';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MEDIA_TYPE } from '@/utils/constants';
import { Box } from '@mui/material';
import { FormikHelpers } from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { useUpdatePost } from '../hooks/useUpdatePost';
import {
  defaultPostFormValues,
  PostFormValues,
} from '../types/post-form-values.type';
import { PostMedia } from '../types/post-media';

const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const {
    data: fetchedPost,
    isLoading: isPostLoading,
    error: postError,
  } = useGetPostDetails(postId);

  // Media state
  const [postMedias, setPostMedias] = useState<PostMedia[]>([]);
  const [thumbnail, setThumbnail] = useState<PostMedia | null>(null);
  const [originalThumbnail, setOriginalThumbnail] = useState<PostMedia | null>(
    null,
  );
  const [hasArtNovaImages, setHasArtNovaImages] = useState(false);

  // Initialize form values only when fetchedPost is available
  const initialFormValues = useMemo((): PostFormValues => {
    if (!fetchedPost) {
      return defaultPostFormValues;
    }
    return {
      title: fetchedPost.title,
      description: fetchedPost.description || '',
      categoryIds: fetchedPost.categories?.map((c) => c.id) ?? [],
      isMature: fetchedPost.isMature,
      thumbnailMeta: fetchedPost.thumbnailCropMeta,
    };
  }, [fetchedPost]);

  // Preload fetched post data into state
  useEffect(() => {
    if (!fetchedPost) return;

    setHasArtNovaImages(fetchedPost.aiCreated);

    // Set thumbnail
    setThumbnail({
      url: fetchedPost.thumbnailUrl,
      type: MEDIA_TYPE.IMAGE,
      file: new File([], 'existing-thumbnail'),
    });

    // Set original thumbnail
    setOriginalThumbnail({
      url: fetchedPost.thumbnailCropMeta?.initialThumbnail,
      type: MEDIA_TYPE.IMAGE,
      file: new File([], 'existing-original-thumbnail'),
    });

    // Build postMedias from fetchedPost.medias
    const initialMedias: PostMedia[] = fetchedPost.medias.map((media) => ({
      url: media.url,
      type: media.mediaType,
      file: new File([], `existing-media-${media.id}`),
    }));

    setPostMedias(initialMedias);
  }, [fetchedPost]);

  const { mutateAsync: updatePost } = useUpdatePost({
    onSuccess: (updatedPost) => {
      showSnackbar('Post updated successfully!', 'success');
      navigate(`/posts/${updatedPost.id}`);
    },
    onError: (errorMessage) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  // Form submission handler
  const handleSubmit = useCallback(
    async (
      values: PostFormValues,
      formikActions: FormikHelpers<PostFormValues>,
    ) => {
      if (postMedias.length === 0) {
        showSnackbar('At least one image or video is required.', 'error');
        formikActions.setSubmitting(false);
        return;
      }

      if (!thumbnail || !originalThumbnail) {
        showSnackbar('Thumbnail is required.', 'error');
        formikActions.setSubmitting(false);
        return;
      }

      try {
        await updatePost({
          postId: parseInt(postId!),
          values,
          postMedias,
          thumbnail,
          originalThumbnail,
          hasArtNovaImages,
          fetchedPost: fetchedPost!,
        });
      } finally {
        formikActions.setSubmitting(false);
      }
    },
    [
      postMedias,
      thumbnail,
      originalThumbnail,
      hasArtNovaImages,
      fetchedPost,
      postId,
      updatePost,
      showSnackbar,
    ],
  );

  // Loading state
  if (isPostLoading) return <Loading />;

  // Error state
  if (postError || !fetchedPost || !initialFormValues) {
    const errorMessage =
      postError instanceof Error
        ? postError.message
        : !fetchedPost
          ? 'Post not found'
          : 'Failed to load post data';

    return (
      <Box className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">
            Error loading post: {errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </Box>
    );
  }

  return (
    <PostForm
      initialFormValues={initialFormValues}
      postMedias={postMedias}
      setPostMedias={setPostMedias}
      thumbnail={thumbnail}
      setThumbnail={setThumbnail}
      originalThumbnail={originalThumbnail}
      setOriginalThumbnail={setOriginalThumbnail}
      hasArtNovaImages={hasArtNovaImages}
      setHasArtNovaImages={setHasArtNovaImages}
      isEditMode={true}
      onSubmit={handleSubmit}
    />
  );
};

export default EditPostPage;
