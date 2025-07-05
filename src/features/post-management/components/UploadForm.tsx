import {
  Box,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { MdCrop, MdPhotoCameraBack } from 'react-icons/md';

import InlineErrorMessage from '@/components/InlineErrorMessage';
import { Checkbox } from '@/components/ui/checkbox';
import ImageCropperModal from '@/components/ui/image-cropper-modal';
import { MEDIA_TYPE } from '@/utils/constants';
import {
  ErrorMessage,
  Field,
  FormikErrors,
  FormikHandlers,
  FormikHelpers,
  FormikTouched,
} from 'formik';
import { ImageUpIcon } from 'lucide-react';
import { PostFormValues } from '../types/post-form-values.type';
import { PostMedia } from '../types/post-media';
import SubjectPicker from './SubjectPicker';

const UploadForm: React.FC<{
  values: PostFormValues;
  setFieldValue: FormikHelpers<PostFormValues>['setFieldValue'];
  onThumbnailAddedOrRemoved: (file: File | null) => void;
  thumbnail: PostMedia | null;
  setThumbnail: React.Dispatch<React.SetStateAction<PostMedia | null>>;
  originalThumbnail: PostMedia | null;
  errors: FormikErrors<PostFormValues>;
  touched: FormikTouched<PostFormValues>;
  handleBlur: FormikHandlers['handleBlur'];
  isMatureAutoDetected: boolean;
}> = ({
  values,
  setFieldValue,
  thumbnail,
  setThumbnail,
  originalThumbnail,
  onThumbnailAddedOrRemoved,
  errors,
  touched,
  isMatureAutoDetected,
}) => {
  const [thumbnailCropOpen, setThumbnailCropOpen] = useState(false);

  return (
    <Box className="mx-auto w-full space-y-3 text-left dark:text-white">
      {/* Artwork Title Box */}
      <Box className="dark:bg-mountain-900 space-y-2 rounded-md">
        <Box className="border-mountain-300 dark:border-mountain-700 border-b p-3">
          <Typography className="text-left text-base font-semibold dark:text-white">
            Title
          </Typography>
        </Box>

        <FormControl
          fullWidth
          error={touched.title && Boolean(errors.title)}
          className="space-y-1 px-3 py-3"
        >
          <Field
            name="title" // Connects to Formik state
            as={TextField} // Render as an MUI TextField
            placeholder="What do you call your artwork"
            variant="outlined"
            error={touched.title && Boolean(errors.title)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '5px',
              },
            }}
            slotProps={{
              input: {
                className:
                  'text-base placeholder:text-mountain-950 bg-white dark:bg-mountain-950 dark:text-mountain-50',
              },
            }}
          />
          <ErrorMessage name="title">
            {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
          </ErrorMessage>
        </FormControl>
      </Box>
      {/* Artwork Description Box */}
      <Box className="dark:bg-mountain-900 space-y-2 rounded-md">
        {/* Heading with bottom border */}
        <Box className="border-mountain-300 dark:border-mountain-700 border-b p-3">
          <Typography className="text-left text-base font-semibold dark:text-white">
            Details
          </Typography>
        </Box>
        <Box className="space-y-1 px-3 pb-3">
          <Typography className="dark:text-mountain-200 text-left text-base">
            Description
          </Typography>
          <Field
            name="description"
            as={TextField}
            placeholder="Describe your work"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            slotProps={{
              input: {
                className:
                  'p-3 text-base dark:placeholder:text-base dark:text-white dark:placeholder:text-mountain-400 text-left',
              },
            }}
          />
        </Box>

        {/* Content / Mature Checkbox */}
        <Box className="px-3 pb-3">
          <Typography className="dark:text-mountain-200 mb-1 text-left text-base">
            Content
          </Typography>
          <FormControl component="fieldset" className="space-y-2 px-2">
            {/* Mature content checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mature-content"
                checked={values.isMature || isMatureAutoDetected}
                disabled={isMatureAutoDetected}
                onCheckedChange={(checked) =>
                  setFieldValue('isMature', checked)
                }
                className={`${
                  isMatureAutoDetected ? 'cursor-not-allowed opacity-50' : ''
                }`}
              />
              <label
                htmlFor="mature-content"
                className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  isMatureAutoDetected
                    ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                    : 'cursor-pointer text-black dark:text-white'
                }`}
              >
                <span
                  className={`ml-1 ${
                    isMatureAutoDetected
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-purple dark:text-white'
                  }`}
                >
                  Has mature content{'\u00A0'}
                </span>
                <span
                  className={`${
                    isMatureAutoDetected
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-black dark:text-white'
                  }`}
                >
                  (see our{' '}
                  <a
                    href="/mature-content"
                    className={`hover:underline ${
                      isMatureAutoDetected
                        ? 'pointer-events-none text-gray-400 dark:text-gray-500'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    guidelines
                  </a>
                  )
                </span>
              </label>
            </div>
          </FormControl>
        </Box>
      </Box>
      {originalThumbnail && (
        <ImageCropperModal
          thumbnailMeta={values.thumbnailMeta}
          originalThumbnailUrl={originalThumbnail.url}
          open={thumbnailCropOpen}
          onClose={() => setThumbnailCropOpen(false)}
          onCropped={(blob, thumbnail_crop_meta) => {
            console.log('Cropped thumbnail meta:', thumbnail_crop_meta);
            setThumbnail({
              file: new File([blob], 'cropped_thumbnail.png', {
                type: 'image/png',
              }),
              url: URL.createObjectURL(blob),
              type: MEDIA_TYPE.IMAGE,
            });

            setFieldValue('thumbnailMeta', thumbnail_crop_meta);
          }}
        />
      )}

      <Box className="space-y-2 px-3">
        <Typography className="dark:text-mountain-200 text-left text-base">
          Thumbnail
        </Typography>
        <Typography
          variant="body2"
          className="dark:text-mountain-400 mb-1 text-gray-700"
        >
          Set a thumbnail that stands out for your post.
        </Typography>
        <Box
          className={`flex flex-col items-center justify-center border ${
            thumbnail ? 'border-none' : 'border-dashed border-gray-500'
          } bg-mountain-200 min-h-32 overflow-hidden rounded`}
          component="label"
        >
          {thumbnail ? (
            <img src={thumbnail.url} alt="Thumbnail" className="max-h-64" />
          ) : (
            <>
              <ImageUpIcon className="text-4xl text-gray-400" />
              <Typography>Upload file</Typography>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onThumbnailAddedOrRemoved(file);
              }
            }}
          />
        </Box>
        {thumbnail && (
          <div className="flex gap-2">
            <Tooltip title="Crop">
              <IconButton
                onClick={() => setThumbnailCropOpen(true)}
                className="border border-gray-300 text-gray-900 dark:border-white dark:text-white"
              >
                <MdCrop />
              </IconButton>
            </Tooltip>

            <Tooltip title="Replace">
              <IconButton
                component="label"
                className="border border-gray-300 text-gray-900 dark:border-white dark:text-white"
              >
                <MdPhotoCameraBack />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onThumbnailAddedOrRemoved(file);
                    }
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </Box>
      {/* Categorization Box */}
      <Box className="dark:bg-mountain-900 space-y-2 rounded-md">
        {/* Heading with bottom border */}
        <Box className="border-mountain-300 dark:border-mountain-700 border-b p-3">
          <Typography className="text-left text-base font-semibold dark:text-white">
            Categorization
          </Typography>
        </Box>

        {/* Art type */}
        <Box className="flex w-full flex-col space-y-1 pb-3">
          {/* Dialog for Selection */}
          <Box className="space-y-1 px-3 pb-3">
            {/** TODO: uncomment this */}
            <SubjectPicker
              cate_ids={values.cate_ids}
              setCateIds={(val) => setFieldValue('cate_ids', val)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UploadForm;
