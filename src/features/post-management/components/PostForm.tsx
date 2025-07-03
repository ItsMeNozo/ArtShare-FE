import { useSnackbar } from '@/hooks/useSnackbar';
import { Box, Button, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useState } from 'react';
import UploadForm from './PostEditor'; // Adjust import path as needed

import { useSubscriptionInfo } from '@/hooks/useSubscription';
import { MEDIA_TYPE } from '@/utils/constants';
import { FaMagic } from 'react-icons/fa';
import * as Yup from 'yup';
import { useGeneratePostContent } from '../hooks/useGeneratePostContent';
import { ThumbnailMeta } from '../types/crop-meta.type';
import { PostFormValues } from '../types/post-form-values.type';
import { PostMedia } from '../types/post-media';
import MediaSelection from './PostMediaManager';

export interface PostFormProps {
  initialFormValues: PostFormValues;
  onSubmit: (
    values: PostFormValues,
    formikActions: FormikHelpers<PostFormValues>,
  ) => Promise<void>;
  isEditMode: boolean;
  postMedias: PostMedia[];
  setPostMedias: React.Dispatch<React.SetStateAction<PostMedia[]>>;
  thumbnail: PostMedia | null;
  setThumbnail: React.Dispatch<React.SetStateAction<PostMedia | null>>;
  originalThumbnail: PostMedia | null;
  setOriginalThumbnail: React.Dispatch<React.SetStateAction<PostMedia | null>>;
  hasArtNovaImages: boolean;
  setHasArtNovaImages: React.Dispatch<React.SetStateAction<boolean>>;
}

const PostForm: React.FC<PostFormProps> = ({
  initialFormValues,
  onSubmit,
  // isEditMode,
  postMedias,
  setPostMedias,
  thumbnail,
  setThumbnail,
  originalThumbnail,
  setOriginalThumbnail,
  hasArtNovaImages,
  setHasArtNovaImages,
}) => {
  const { showSnackbar } = useSnackbar();
  const { data: subscriptionInfo } = useSubscriptionInfo();
  const [isMatureAutoDetected, setIsMatureAutoDetected] = useState(false);

  const isUploadMediaValid = postMedias.length > 0;

  const { mutate: generateContent } = useGeneratePostContent({
    onError: (errorMessage: string) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  const handleGenerateContent = async (
    setFieldValue: FormikHelpers<PostFormValues>['setFieldValue'],
  ) => {
    if (postMedias.length === 0) {
      showSnackbar('Please upload an image first.', 'error');
      return;
    }

    if (subscriptionInfo?.aiCreditRemaining === 0) {
      showSnackbar(
        'You’ve run out of AI credits. Upgrade your plan or come back later.',
        'warning',
      );
      return;
    }

    const formData = new FormData();
    postMedias.forEach(({ file }) => formData.append('images', file));

    generateContent(formData, {
      onSuccess: (data) => {
        const { title, description, categories } = data;
        setFieldValue('title', title);
        setFieldValue('description', description);
        setFieldValue(
          'cate_ids',
          categories.map((cate) => cate.id),
        );
      },
    });
  };

  const handleThumbnailAddedOrRemoved = (
    file: File | null,
    setFieldValue: FormikHelpers<PostFormValues>['setFieldValue'],
  ) => {
    setFieldValue('thumbnailMeta', {
      crop: { x: 0, y: 0 },
      zoom: 1,
      aspect: undefined,
      selectedAspect: 'Original',
    } as ThumbnailMeta);

    if (!file) {
      setThumbnail(null);
      setOriginalThumbnail(null);
      return;
    }
    const newThumbnail: PostMedia = {
      file,
      type: MEDIA_TYPE.IMAGE,
      url: URL.createObjectURL(file),
    };
    setThumbnail(newThumbnail);
    setOriginalThumbnail(newThumbnail);
  };

  const postValidationSchema = Yup.object().shape({
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .required('Title is required'),
    // cate_ids: Yup.array().min(1, 'Please select at least one category').required('Categories are required'),
    description: Yup.string().defined().optional(),
  });

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={postValidationSchema}
      onSubmit={onSubmit}
      // enableReinitialize // Important for forms whose initial values load asynchronously
    >
      {(formikProps: FormikProps<PostFormValues>) => {
        const {
          values,
          errors,
          touched,
          // handleChange,
          handleBlur,
          setFieldValue,
          isSubmitting,
        } = formikProps;

        return (
          <Form className="dark:bg-mountain-950 h-full w-full">
            <Box
              className="flex h-[calc(100vh-4rem)] w-full gap-3 p-4"
              style={{ overflow: 'hidden' }}
            >
              {/* LEFT COLUMN */}
              <MediaSelection
                postMedias={postMedias}
                setPostMedias={setPostMedias}
                onThumbnailAddedOrRemoved={(file: File | null) =>
                  handleThumbnailAddedOrRemoved(file, setFieldValue)
                }
                hasArtNovaImages={hasArtNovaImages}
                setHasArtNovaImages={setHasArtNovaImages}
                isMatureAutoDetected={isMatureAutoDetected}
                handleIsMatureAutoDetected={(val) => {
                  setIsMatureAutoDetected(val); // Update local state for potential UI cues
                  if (values.isMature !== val) {
                    setFieldValue('isMature', val);
                  }
                }}
              />
              {/* RIGHT COLUMN: FORM FIELDS & ACTIONS */}
              <Box className="flex w-[40%] flex-col space-y-3">
                {/* Form fields */}
                <Box className="custom-scrollbar relative w-full overflow-y-auto rounded-md pr-4">
                  <Tooltip
                    title="Auto generate content (title, description, categories) - Credit cost: ~2"
                    arrow
                    placement="left"
                  >
                    <Button
                      className="sticky top-2 z-50 ml-auto flex h-12 w-12 min-w-0 transform items-center justify-center rounded-full bg-gradient-to-b from-blue-400 to-purple-400 p-0 shadow-md duration-300 ease-in-out hover:scale-105 hover:cursor-pointer"
                      onClick={() => handleGenerateContent(setFieldValue)}
                    >
                      <FaMagic className="size-5 text-white" />
                    </Button>
                  </Tooltip>
                  <UploadForm
                    values={values}
                    setFieldValue={setFieldValue}
                    thumbnail={thumbnail}
                    setThumbnail={setThumbnail}
                    originalThumbnail={originalThumbnail}
                    onThumbnailAddedOrRemoved={(file: File | null) =>
                      handleThumbnailAddedOrRemoved(file, setFieldValue)
                    }
                    errors={errors}
                    touched={touched}
                    handleBlur={handleBlur}
                    isMatureAutoDetected={isMatureAutoDetected}
                  />
                </Box>
                <hr className="border-mountain-300 dark:border-mountain-700 w-full border-t-1" />
                {/* Bottom actions */}
                <Box className="mt-auto flex w-full justify-end bg-none pr-4">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isUploadMediaValid || isSubmitting}
                    className="ml-auto rounded-md"
                    sx={{
                      textTransform: 'none',
                      background: !isUploadMediaValid
                        ? 'linear-gradient(to right, #9ca3af, #6b7280)' // Tailwind's gray-400 to gray-500
                        : 'linear-gradient(to right, #3730a3, #5b21b6, #4c1d95)', // indigo-violet gradient
                      color: 'white',
                      opacity: !isUploadMediaValid ? 0.6 : 1,
                      pointerEvents: !isUploadMediaValid ? 'none' : 'auto',
                      '&:hover': {
                        background: !isUploadMediaValid
                          ? 'linear-gradient(to right, #9ca3af, #6b7280)'
                          : 'linear-gradient(to right, #312e81, #4c1d95, #3b0764)',
                      },
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default PostForm;
