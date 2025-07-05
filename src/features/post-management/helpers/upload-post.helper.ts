import { PostMedia } from '../types/post-media';

export const getImageFilesFromPostMedias = (
  postMedias: PostMedia[],
): File[] => {
  return postMedias
    .filter((media) => media.type === 'image')
    .map((media) => media.file);
};

export const getVideoFileFromPostMedias = (
  postMedias: PostMedia[],
): File | undefined => {
  return postMedias.find((media) => media.type === 'video')?.file;
};

interface CreateFormDataParams {
  title: string;
  thumbnailUrl: string;
  thumbnailCropMeta: string;
  description?: string;
  imageFiles?: File[];
  videoUrl?: string;
  initialThumbnailUrl?: string;
  isMature?: boolean;
  aiCreated?: boolean;
  cate_ids?: number[];
  prompt_id?: number;
}

export const createFormData = ({
  title,
  thumbnailUrl,
  thumbnailCropMeta,
  description,
  imageFiles,
  videoUrl,
  initialThumbnailUrl,
  isMature,
  aiCreated,
  cate_ids,
  prompt_id,
}: CreateFormDataParams) => {
  const formData = new FormData();
  formData.append('title', title);
  if (description) formData.append('description', description);
  if (videoUrl) formData.append('video_url', videoUrl);
  formData.append('thumbnail_url', thumbnailUrl);
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => formData.append('images', file));
  }
  formData.append('is_mature', String(isMature));
  formData.append('ai_created', String(aiCreated));
  formData.append('cate_ids', JSON.stringify(cate_ids));
  formData.append(
    'thumbnail_crop_meta',
    JSON.stringify({
      ...JSON.parse(thumbnailCropMeta),
      initialThumbnail: initialThumbnailUrl,
    }),
  );
  if (prompt_id) formData.append('prompt_id', String(prompt_id));

  return formData;
};
