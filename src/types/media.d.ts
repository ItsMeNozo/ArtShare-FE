import { MEDIA_TYPE } from '@/utils/constants';

export interface MediaDto {
  id: number;
  post_id: number;
  media_type: MEDIA_TYPE;
  description?: string;
  url: string;
  creator_id: string;
  downloads: number;
  created_at: Date;
}
