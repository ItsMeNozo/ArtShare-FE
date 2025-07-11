import { useSnackbar } from '@/hooks/useSnackbar';
import React, { useEffect, useState } from 'react';

import { MEDIA_TYPE } from '@/utils/constants';
import { fetchImageFileFromUrl } from '@/utils/fetch-media.utils';
import { FormikHelpers } from 'formik';
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

  const handleSubmitForCreate = async (
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

    if (hasArtNovaImages && !promptId) {
      showSnackbar('something went wrong, please try again.', 'error');
      console.error(
        'AI generated images are selected but no prompt ID is provided.',
      );
      formikActions.setSubmitting(false);
      return;
    }

    await createPost(
      {
        values,
        postMedias,
        thumbnail,
        originalThumbnail,
        promptId,
        hasArtNovaImages,
      },
      {
        onSettled: () => {
          formikActions.setSubmitting(false);
        },
      },
    );
  };

  useEffect(() => {
    if (!selectedPrompt) return;

    const fetchFilesFromUrls = async () => {
      try {
        const aiImageMedias = selectedPrompt.imageUrls.map((url) => ({
          type: MEDIA_TYPE.IMAGE,
          url: url,
          file: new File([], 'temp_image.png', { type: 'image/png' }), // Placeholder file
        }));
        setPostMedias(aiImageMedias);

        // update medias file in the background
        const updatePostMediasFileAsync = async () => {
          const aiImageMediasWithRealFile = await Promise.all(
            aiImageMedias.map(async (media) => {
              const file = await fetchImageFileFromUrl(media.url);
              return { ...media, file };
            }),
          );
          setPostMedias(aiImageMediasWithRealFile);

          const thumbnail = {
            file: aiImageMediasWithRealFile[0].file,
            type: MEDIA_TYPE.IMAGE,
            url: aiImageMediasWithRealFile[0].url,
          };
          setThumbnail(thumbnail);
          setOriginalThumbnail(thumbnail);
          setPromptId(selectedPrompt.id);
        };
        updatePostMediasFileAsync();
      } catch (err) {
        console.error('Error fetching images from S3', err);
      }
    };

    fetchFilesFromUrls();
    setHasArtNovaImages(true);

    // clear prompt out of history
    navigate(location.pathname, {
      replace: true, // swap current entry instead of pushing
      state: {}, // or `state: null`
    });
  }, [location.pathname, navigate, selectedPrompt]);

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
