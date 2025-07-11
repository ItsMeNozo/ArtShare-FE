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
  categoryIds?: number[];
  promptId?: number;
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
  categoryIds,
  promptId,
}: CreateFormDataParams) => {
  const formData = new FormData();
  formData.append('title', title);
  if (description) formData.append('description', description);
  if (videoUrl) formData.append('videoUrl', videoUrl);
  if (thumbnailUrl) {
    formData.append('thumbnailUrl', thumbnailUrl);
  }
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => formData.append('images', file));
  }
  formData.append('isMature', String(isMature));
  formData.append('aiCreated', String(aiCreated));
  formData.append('categoryIds', JSON.stringify(categoryIds));
  formData.append(
    'thumbnailCropMeta',
    JSON.stringify({
      ...JSON.parse(thumbnailCropMeta),
      initialThumbnail: initialThumbnailUrl,
    }),
  );
  if (promptId) formData.append('promptId', String(promptId));

  return formData;
};
