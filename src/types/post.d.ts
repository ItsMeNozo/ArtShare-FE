import { Category } from './category';
import { MediaDto } from './media';
import { User } from './user';

export interface Post {
  id: number;
  user_id: string;
  title: string;
  created_at: Date;
  is_published: boolean;
  is_private: boolean;
  share_count: number;
  comment_count: number;
  like_count: number;
  view_count: number;
  thumbnail_url: string;
  is_mature: boolean;
  ai_created: boolean;
  user: User;
  description?: string;
  updated_at?: Date;
  group_id?: number;
  medias: MediaDto[];
  categories?: Category[];
  thumbnail_crop_meta: ThumbnailMeta;
}
