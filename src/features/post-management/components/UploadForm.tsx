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
    <Box className="space-y-3 mx-auto w-full dark:text-white text-left">
      {/* Artwork Title Box */}
      <Box className="space-y-2 dark:bg-mountain-900 rounded-md">
        <Box className="p-3 border-mountain-300 dark:border-mountain-700 border-b">
          <Typography className="font-semibold dark:text-white text-base text-left">
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
      <Box className="space-y-2 dark:bg-mountain-900 rounded-md">
        {/* Heading with bottom border */}
        <Box className="p-3 border-mountain-300 dark:border-mountain-700 border-b">
          <Typography className="font-semibold dark:text-white text-base text-left">
            Details
          </Typography>
        </Box>
        <Box className="space-y-1 px-3 pb-3">
          <Typography className="dark:text-mountain-200 text-base text-left">
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
          <Typography className="mb-1 dark:text-mountain-200 text-base text-left">
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
                  isMatureAutoDetected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <label
                htmlFor="mature-content"
                className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  isMatureAutoDetected
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-black dark:text-white cursor-pointer'
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
                        ? 'text-gray-400 dark:text-gray-500 pointer-events-none'
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
        <Typography className="dark:text-mountain-200 text-base text-left">
          Thumbnail
        </Typography>
        <Typography
          variant="body2"
          className="mb-1 text-gray-700 dark:text-mountain-400"
        >
          Set a thumbnail that stands out for your post.
        </Typography>
        <Box
          className={`flex flex-col justify-center items-center border ${
            thumbnail ? 'border-none' : 'border-gray-500 border-dashed'
          } rounded min-h-32 overflow-hidden bg-mountain-200`}
          component="label"
        >
          {thumbnail ? (
            <img src={thumbnail.url} alt="Thumbnail" className="max-h-64" />
          ) : (
            <>
              <ImageUpIcon className="text-gray-400 text-4xl" />
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
                className="border border-gray-300 dark:border-white text-gray-900 dark:text-white"
              >
                <MdCrop />
              </IconButton>
            </Tooltip>

            <Tooltip title="Replace">
              <IconButton
                component="label"
                className="border border-gray-300 dark:border-white text-gray-900 dark:text-white"
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
      <Box className="space-y-2 dark:bg-mountain-900 rounded-md">
        {/* Heading with bottom border */}
        <Box className="p-3 border-mountain-300 dark:border-mountain-700 border-b">
          <Typography className="font-semibold dark:text-white text-base text-left">
            Categorization
          </Typography>
        </Box>

        {/* Art type */}
        <Box className="flex flex-col space-y-1 pb-3 w-full">
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
