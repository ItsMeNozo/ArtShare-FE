import { UnsavedChangesProtector } from '@/components/UnsavedChangesProtector';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import { MEDIA_TYPE } from '@/utils/constants';
import { Box, Button, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useState } from 'react';
import { FaMagic } from 'react-icons/fa';
import * as Yup from 'yup';
import { useGeneratePostContent } from '../hooks/useGeneratePostContent';
import { ThumbnailMeta } from '../types/crop-meta.type';
import { PostFormValues } from '../types/post-form-values.type';
import { PostMedia } from '../types/post-media';
import PostEditor from './PostEditor'; // Adjust import path as needed
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
  isEditMode,
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
  const [mediasTouched, setMediasTouched] = useState(false);
  const [thumbnailTouched, setThumbnailTouched] = useState(false);

  const { mutate: generateContent } = useGeneratePostContent({
    onError: (errorMessage: string) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  const handleGenerateContent = async (
    setFieldValue: FormikHelpers<PostFormValues>['setFieldValue'],
    formikProps: FormikProps<PostFormValues>
  ) => {
    if (
      postMedias.filter((media) => media.type === MEDIA_TYPE.IMAGE).length === 0
    ) {
      showSnackbar('The feature only works on images', 'warning');
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
          'categoryIds',
          categories.map((cate) => cate.id),
        );
        setTimeout(() => {
          formikProps.validateForm();
        }, 0);
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
      onSubmit={async (values, formikActions) =>
        await onSubmit(values, formikActions)
      }
    // enableReinitialize // Important for forms whose initial values load asynchronously
    >
      {(formikProps: FormikProps<PostFormValues>) => {
        const {
          values,
          errors,
          touched,
          dirty,
          handleBlur,
          setFieldValue,
          isSubmitting,
          isValid,
        } = formikProps;

        const isAllDirty = mediasTouched || thumbnailTouched || dirty;
        
        const isValidToSubmit = isAllDirty && !isSubmitting && isValid;

        return (
          <>
            <UnsavedChangesProtector isDirty={isAllDirty && !isSubmitting} />
            <Form className="dark:bg-mountain-950 w-full h-full">
              <Box
                className="flex gap-3 p-4 w-full h-[calc(100vh-4rem)]"
                style={{ overflow: 'hidden' }}
                data-testid="upload-post-form"
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
                    setIsMatureAutoDetected(val);
                    if (values.isMature !== val) {
                      setFieldValue('isMature', val);
                    }
                  }}
                  onMediasChanged={() => setMediasTouched(true)}
                />
                {/* RIGHT COLUMN: FORM FIELDS & ACTIONS */}
                <Box className="flex flex-col space-y-3 w-[40%]">
                  {/* Form fields */}
                  <Box className="relative pr-4 rounded-md w-full overflow-y-auto custom-scrollbar">
                    <Tooltip
                      title="Auto generate content (title, description, categories) based on images - Credit cost: ~2"
                      arrow
                      placement="left"
                    >
                      <Button
                        className="top-2 z-50 sticky flex justify-center items-center bg-gradient-to-b from-blue-400 to-purple-400 shadow-md ml-auto p-0 rounded-full w-12 min-w-0 h-12 hover:scale-105 duration-300 ease-in-out hover:cursor-pointer transform"
                        onClick={() =>
                          handleGenerateContent(setFieldValue, formikProps)
                        }
                      >
                        <FaMagic className="size-5 text-white" />
                      </Button>
                    </Tooltip>
                    <PostEditor
                      values={values}
                      setFieldValue={setFieldValue}
                      thumbnail={thumbnail}
                      setThumbnail={setThumbnail}
                      originalThumbnail={originalThumbnail}
                      onThumbnailAddedOrRemoved={(file: File | null) => {
                        handleThumbnailAddedOrRemoved(file, setFieldValue);
                        setThumbnailTouched(true);
                      }}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      isMatureAutoDetected={isMatureAutoDetected}
                      onThumbnailChange={() => setThumbnailTouched(true)}
                    />
                  </Box>
                  <hr className="border-mountain-300 dark:border-mountain-700 border-t-1 w-full" />
                  {/* Bottom actions */}
                  <Box className="flex justify-end bg-none mt-auto pr-4 w-full">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isValidToSubmit}
                      className="ml-auto rounded-md"
                    // sx={{
                    //   textTransform: 'none',
                    //   background: isValidToSubmit
                    //     ? 'linear-gradient(to right, #3730a3, #5b21b6, #4c1d95)' // indigo-violet gradient
                    //     : 'linear-gradient(to right, #9ca3af, #6b7280)', // Tailwind's gray-400 to gray-500
                    //   color: 'white',
                    //   opacity: isValidToSubmit ? 1 : 0.6,
                    //   pointerEvents: isValidToSubmit ? 'auto' : 'none',
                    //   '&:hover': {
                    //     background: isValidToSubmit
                    //       ? 'linear-gradient(to right, #312e81, #4c1d95, #3b0764)'
                    //       : 'linear-gradient(to right, #9ca3af, #6b7280)',
                    //   },
                    // }}
                    >
                      { isEditMode ? 'Save Changes' : 'Submit' }
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default PostForm;
