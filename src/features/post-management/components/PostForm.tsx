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
import { PostMedia, ThumbnailData } from '../types/post-media';
import PostEditor from './PostEditor';
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
    formikProps: FormikProps<PostFormValues>,
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
    thumbnailData: ThumbnailData,
    setFieldValue: FormikHelpers<PostFormValues>['setFieldValue'],
  ) => {
    const { file, width, height } = thumbnailData;

    const aspect = width && height ? width / height : undefined;

    setFieldValue('thumbnailMeta', {
      crop: { x: 0, y: 0 },
      zoom: 1,
      aspect: aspect,
      selectedAspect: 'Original',
      width: width,
      height: height,
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

    description: Yup.string().defined().optional(),
  });

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={postValidationSchema}
      onSubmit={async (values, formikActions) =>
        await onSubmit(values, formikActions)
      }
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
            <Form className="dark:bg-mountain-950 h-full w-full">
              <Box
                className="flex h-[calc(100vh-4rem)] w-full gap-3 p-4"
                style={{ overflow: 'hidden' }}
                data-testid="upload-post-form"
              >
                {/* LEFT COLUMN */}
                <MediaSelection
                  postMedias={postMedias}
                  setPostMedias={setPostMedias}
                  onThumbnailAddedOrRemoved={(thumbnailData: ThumbnailData) =>
                    handleThumbnailAddedOrRemoved(thumbnailData, setFieldValue)
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
                <Box className="flex w-[40%] flex-col space-y-3">
                  {/* Form fields */}
                  <Box className="custom-scrollbar relative w-full overflow-y-auto rounded-md pr-4">
                    <Tooltip
                      title="Auto generate content (title, description, categories) based on images - Credit cost: ~2"
                      arrow
                      placement="left"
                    >
                      <Button
                        className="sticky top-2 z-50 ml-auto flex h-12 w-12 min-w-0 transform items-center justify-center rounded-full bg-gradient-to-b from-blue-400 to-purple-400 p-0 shadow-md duration-300 ease-in-out hover:scale-105 hover:cursor-pointer"
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
                      onThumbnailAddedOrRemoved={(
                        thumbnailData: ThumbnailData,
                      ) => {
                        handleThumbnailAddedOrRemoved(
                          thumbnailData,
                          setFieldValue,
                        );
                        setThumbnailTouched(true);
                      }}
                      errors={errors}
                      touched={touched}
                      handleBlur={handleBlur}
                      isMatureAutoDetected={isMatureAutoDetected}
                      onThumbnailChange={() => setThumbnailTouched(true)}
                    />
                  </Box>
                  <hr className="border-mountain-300 dark:border-mountain-700 w-full border-t-1" />
                  {/* Bottom actions */}
                  <Box className="mt-auto flex w-full justify-end bg-none pr-4">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isValidToSubmit}
                      className="ml-auto rounded-md"
                    >
                      {isEditMode ? 'Save Changes' : 'Submit'}
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
