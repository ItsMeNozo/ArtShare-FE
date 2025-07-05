import api from '@/api/baseApi';

export type ThumbnailCropMeta = {
  crop_x: number;
  crop_y: number;
  crop_w: number;
  crop_h: number;
  zoom: number;
  aspect?: number | 'free';
};

export const patchThumbnailMeta = async (
  postId: number,
  meta: ThumbnailCropMeta,
) => {
  return await api.patch(`/posts/${postId}/thumbnail-crop`, meta);
};
