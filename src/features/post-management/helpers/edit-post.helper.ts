import { PostMedia } from '../types/post-media';

export const getImageUrlsToRetain = (imageMedias: PostMedia[]): string[] => {
  return imageMedias
    .filter((media) => media.file.size === 0)
    .map((media) => media.url);
};

export const getNewImageFiles = (imageMedias: PostMedia[]): File[] => {
  return imageMedias
    .filter((media) => media.file.size > 0)
    .map((media) => media.file);
};

export const getNewVideoFile = (videoMedia?: PostMedia): File | undefined => {
  if (!videoMedia) return undefined;
  return videoMedia.file.size > 0 ? videoMedia.file : undefined;
};

export const getNewlyUploadedRequiredFile = (
  thumbnail: PostMedia,
): File | undefined => {
  return thumbnail.file.size > 0 ? thumbnail.file : undefined;
};

interface EditFormDataParams {
  title: string;
  imageUrlsToRetain: string[];
  newImageFiles: File[];
  cate_ids: number[];
  thumbnailCropMeta: string;
  description?: string;
  videoUrl?: string;
  initialThumbnail?: string;
  thumbnailUrl?: string;
  isMature?: boolean;
  aiCreated?: boolean;
}

export const createFormDataForEdit = ({
  title,
  imageUrlsToRetain,
  newImageFiles,
  cate_ids,
  thumbnailCropMeta,
  description,
  videoUrl,
  initialThumbnail,
  thumbnailUrl,
  isMature,
  aiCreated,
}: EditFormDataParams) => {
  const formData = new FormData();
  formData.append('title', title);
  if (description !== undefined) formData.append('description', description);
  // TODO: uncomment this
  formData.append('cate_ids', JSON.stringify(cate_ids));
  formData.append('video_url', videoUrl ?? '');

  if (thumbnailUrl) formData.append('thumbnail_url', thumbnailUrl);
  newImageFiles
    .filter((file) => file.size > 0) // ⛔️ exclude dummy
    .forEach((file) => formData.append('images', file));

  if (imageUrlsToRetain.length > 0) {
    formData.append('existing_image_urls', JSON.stringify(imageUrlsToRetain));
  }

  formData.append('is_mature', String(isMature));
  formData.append('ai_created', String(aiCreated));
  formData.append(
    'thumbnail_crop_meta',
    JSON.stringify({
      ...JSON.parse(thumbnailCropMeta),
      initialThumbnail: initialThumbnail,
    }),
  );
  return formData;
};
