import { useSnackbar } from '@/hooks/useSnackbar';
import { MEDIA_TYPE } from '@/utils/constants';
import { fetchImageFileFromUrl } from '@/utils/fetch-media.utils';
import { FormikHelpers } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { useCreatePost } from '../hooks/useCreatePost';
import {
  PostFormValues,
  defaultPostFormValues,
} from '../types/post-form-values.type';
import { PostMedia } from '../types/post-media';

const UploadPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const location = useLocation();
  const selectedPrompt: PromptResult | undefined = location.state?.prompt;
  const fromEditorImage: File | undefined = location.state?.fromEditorImage;

  const [promptId, setPromptId] = useState<number | null>(null);
  const [hasArtNovaImages, setHasArtNovaImages] = useState(false);
  const [postMedias, setPostMedias] = useState<PostMedia[]>([]);
  const [thumbnail, setThumbnail] = useState<PostMedia | null>(null);
  const [originalThumbnail, setOriginalThumbnail] = useState<PostMedia | null>(
    null,
  );

  const { mutateAsync: createPost } = useCreatePost({
    onSuccess: (createdPost) => {
      navigate(`/posts/${createdPost.id}`);
      showSnackbar('Post successfully created!', 'success');
    },
    onError: (errorMessage) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  const clearNavigationState = useCallback(() => {
    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location.pathname, navigate]);

  const validateSubmission = (_values: PostFormValues): string | null => {
    if (postMedias.length === 0)
      return 'At least one image or video is required.';
    if (!thumbnail || !originalThumbnail) return 'Thumbnail is required.';
    if (hasArtNovaImages && !promptId)
      return 'something went wrong, please try again.';
    return null;
  };

  const handleSubmitForCreate = async (
    values: PostFormValues,
    formikActions: FormikHelpers<PostFormValues>,
  ) => {
    const validationError = validateSubmission(values);
    if (validationError) {
      showSnackbar(validationError, 'error');
      if (validationError.includes('something went wrong')) {
        console.error(
          'AI generated images are selected but no prompt ID is provided.',
        );
      }
      formikActions.setSubmitting(false);
      return;
    }

    await createPost(
      {
        values,
        postMedias,
        thumbnail: thumbnail!,
        originalThumbnail: originalThumbnail!,
        promptId,
        hasArtNovaImages,
      },
      {
        onSettled: () => formikActions.setSubmitting(false),
      },
    );
  };

  useEffect(() => {
    if (!fromEditorImage) return;

    const editedImage: PostMedia = {
      type: MEDIA_TYPE.IMAGE,
      url: URL.createObjectURL(fromEditorImage),
      file: fromEditorImage,
    };

    setPostMedias([editedImage]);
    setThumbnail(editedImage);
    setOriginalThumbnail(editedImage);
    clearNavigationState();
  }, [fromEditorImage, clearNavigationState]);

  useEffect(() => {
    if (!selectedPrompt) return;

    const processPromptImages = async () => {
      try {
        const placeholderMedias = selectedPrompt.imageUrls.map((url) => ({
          type: MEDIA_TYPE.IMAGE,
          url,
          file: new File([], 'temp_image.png', { type: 'image/png' }),
        }));

        setPostMedias(placeholderMedias);
        setHasArtNovaImages(true);

        const realMedias = await Promise.all(
          selectedPrompt.imageUrls.map(async (url) => {
            const file = await fetchImageFileFromUrl(url);
            return {
              type: MEDIA_TYPE.IMAGE,
              url,
              file,
            };
          }),
        );

        setPostMedias(realMedias);
        const firstMedia = realMedias[0];
        setThumbnail(firstMedia);
        setOriginalThumbnail(firstMedia);
        setPromptId(selectedPrompt.id);
      } catch (err) {
        console.error('Error processing AI images:', err);
        showSnackbar('Failed to load AI generated images', 'error');
      }
    };

    processPromptImages();
    clearNavigationState();
  }, [selectedPrompt, clearNavigationState, showSnackbar]);

  return (
    <PostForm
      initialFormValues={defaultPostFormValues}
      postMedias={postMedias}
      setPostMedias={setPostMedias}
      thumbnail={thumbnail}
      setThumbnail={setThumbnail}
      originalThumbnail={originalThumbnail}
      setOriginalThumbnail={setOriginalThumbnail}
      hasArtNovaImages={hasArtNovaImages}
      setHasArtNovaImages={setHasArtNovaImages}
      isEditMode={false}
      onSubmit={handleSubmitForCreate}
    />
  );
};

export default UploadPostPage;
