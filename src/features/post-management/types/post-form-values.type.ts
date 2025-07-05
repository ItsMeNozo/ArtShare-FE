import { ThumbnailMeta } from './crop-meta.type';

export interface PostFormValues {
  title: string;
  description?: string;
  cate_ids: number[];
  isMature: boolean;
  thumbnailMeta: ThumbnailMeta;
}

export const defaultPostFormValues: PostFormValues = {
  title: '',
  cate_ids: [],
  isMature: false,
  thumbnailMeta: {
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: undefined,
    selectedAspect: 'Original',
  } as ThumbnailMeta,
};
