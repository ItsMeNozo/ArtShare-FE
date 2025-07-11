import { MEDIA_TYPE } from '@/utils/constants';

export interface PostMedia {
  url: string;
  type: MEDIA_TYPE;
  file: File;
  isMature?: boolean;
}
