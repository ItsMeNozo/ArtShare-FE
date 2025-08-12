import { MEDIA_TYPE } from '@/utils/constants';

export interface PostMedia {
  url: string;
  type: MEDIA_TYPE;
  file: File;
  isMature?: boolean;
}

export interface ThumbnailData {
  file: File | null;
  width?: number;
  height?: number;
}
