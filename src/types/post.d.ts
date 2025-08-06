import { Category } from './category';
import { MediaDto } from './media';
import { User } from './user';

export interface Post {
  id: number;
  userId: string;
  title: string;
  createdAt: Date;
  isPublished: boolean;
  isPrivate: boolean;
  shareCount: number;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  thumbnailUrl: string;
  isMature: boolean;
  aiCreated: boolean;
  user: User;
  description?: string;
  updatedAt?: Date;
  groupId?: number;
  medias: MediaDto[];
  categories?: Category[];
  thumbnailCropMeta: ThumbnailMeta;
  thumbnailWidth: number;
  thumbnailHeight: number;
}
