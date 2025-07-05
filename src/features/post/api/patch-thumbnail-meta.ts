import api from '@/api/baseApi';

export type ThumbnailCropMeta = {
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  zoom: number;
  aspect?: number | 'free';
};

export const patchThumbnailMeta = async (
  postId: number,
  meta: ThumbnailCropMeta,
) => {
  return await api.patch(`/posts/${postId}/thumbnail-crop`, meta);
};
