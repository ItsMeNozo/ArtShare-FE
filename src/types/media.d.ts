import { MEDIA_TYPE } from '@/utils/constants';

export interface MediaDto {
  id: number;
  postId: number;
  mediaType: MEDIA_TYPE;
  description?: string;
  url: string;
  creatorId: string;
  downloads: number;
  createdAt: Date;
}
