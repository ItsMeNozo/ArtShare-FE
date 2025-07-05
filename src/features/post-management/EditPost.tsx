import Loading from '@/components/loading/Loading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MEDIA_TYPE } from '@/utils/constants';
import { Box } from '@mui/material';
import { FormikHelpers } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPostDetails } from '../post/hooks/useGetPostDetails';
import { useUpdatePost } from './hooks/useUpdatePost';
import PostForm from './PostForm';
import { PostFormValues } from './types/post-form-values.type';
import { PostMedia } from './types/post-media';

/**
 * EditPostPage – fully‑screen page that reuses UploadPost components
 * Route: /posts/:postId/edit
 */
const EditPost: React.FC = () => {
  /** ──────────────────── fetch post data ─────────────────── */
  const { postId } = useParams<{ postId: string }>();
  const {
    data: fetchedPost,
    isLoading: isPostLoading,
    error: postError,
  } = useGetPostDetails(postId);

  /** ─────────────────── internal UI state (mirrors UploadPost) ─────────────────── */
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [postMedias, setPostMedias] = useState<PostMedia[]>([]);
  const [thumbnail, setThumbnail] = useState<PostMedia | null>(null);
  const [originalThumbnail, setOriginalThumbnail] = useState<PostMedia | null>(
    null,
  );
  const [hasArtNovaImages, setHasArtNovaImages] = useState(false);

  /** ─────────────────── preload fetched post into state ─────────────────── */

  useEffect(() => {
    if (!fetchedPost) return;

    setHasArtNovaImages(fetchedPost.ai_created);

    setThumbnail({
      url: fetchedPost.thumbnail_url,
      type: MEDIA_TYPE.IMAGE,
      file: new File([], 'template file for thumbnail'),
    });
    setOriginalThumbnail({
      url: fetchedPost.thumbnail_crop_meta.initialThumbnail,
      type: MEDIA_TYPE.IMAGE,
      file: new File([], 'template file for thumbnail'),
    });

    // build postMedias from postData.medias
    const initialMedias = fetchedPost.medias.map((media) => ({
      url: media.url,
      type: media.media_type,
      file: new File([], 'template file for existing media'),
    }));

    setPostMedias(initialMedias);
  }, [fetchedPost]);

  const initialFormValues = useMemo((): PostFormValues => {
    if (!fetchedPost) {
      console.error('Fetched post data is not available');
      throw new Error('Fetched post data is not available');
    }
    return {
      title: fetchedPost.title,
      description: fetchedPost.description,
      cate_ids: fetchedPost.categories?.map((c) => c.id) ?? [],
      isMature: fetchedPost.is_mature,
      thumbnailMeta: fetchedPost.thumbnail_crop_meta,
    };
  }, [fetchedPost]);

  /** ─────────────────── submit ─────────────────── */

  const { mutate: updatePost } = useUpdatePost({
    onSuccess: (updatedPost) => {
      navigate(`/posts/${updatedPost.id}`);
    },
    onError: (errorMessage) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  const handleSubmit = async (
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

    updatePost(
      {
        postId: parseInt(postId!),
        values,
        postMedias,
        thumbnail,
        originalThumbnail,
        hasArtNovaImages,
        fetchedPost: fetchedPost!,
      },
      {
        onSettled: () => {
          formikActions.setSubmitting(false);
        },
      },
    );
  };

  /** ─────────────────── render ─────────────────── */
  if (isPostLoading) return <Loading />;
  if (postError || !fetchedPost) {
    return (
      <Box className="flex h-full items-center justify-center text-red-500">
        <p>
          Error loading post:{' '}
          {postError instanceof Error ? postError.message : 'Unknown error'}
        </p>
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

export default EditPost;
