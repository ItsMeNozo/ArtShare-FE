import { Category } from './category.d';

export interface Blog {
  categories?: Category[];
  id: number;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  updatedAt?: string | null;
  averageRating: number;
  isProtected: boolean;
  ratingCount: number;
  pictures: string[];
  embeddedVideos: string[];
  viewCount: number;
  isLikedByCurrentUser: boolean;
  user: {
    id: string;
    username: string;
    fullName?: string | null;
    profilePictureUrl?: string | null;
    followersCount: number;
    isFollowing: boolean;
  };
}

export interface BlogUser {
  id: string;
  username: string;
  profilePictureUrl: string | null;
  fullName?: string | null;
}

export interface BlogCategory {
  id: number;
  name: string;
}

export interface SimpleBlogResponseDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isPublished: boolean;
  pictures: string[];
  user: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    fullName?: string;
    followersCount: number;
    isFollowing: boolean;
  };
}

export const mapSimpleBlogResponseToBlog = (
  dto: SimpleBlogResponseDto,
): Blog => ({
  id: dto.id,
  userId: dto.user.id,
  title: dto.title,
  content: dto.content,
  createdAt: dto.createdAt,
  isPublished: dto.isPublished,
  likeCount: dto.likeCount,
  commentCount: dto.commentCount,
  viewCount: dto.viewCount,
  shareCount: dto.shareCount,
  updatedAt: dto.updatedAt,
  averageRating: 0, // Not provided in response
  isProtected: false, // Not provided in response
  ratingCount: 0, // Not provided in response
  pictures: dto.pictures,
  embeddedVideos: [], // Not provided in response
  isLikedByCurrentUser: false, // Not provided in response
  user: {
    id: dto.user.id,
    username: dto.user.username,
    fullName: dto.user.fullName,
    profilePictureUrl:
      dto.user.profilePictureUrl === '' ? null : dto.user.profilePictureUrl,
    followersCount: dto.user.followersCount,
    isFollowing: dto.user.isFollowing,
  },
  categories: [], // Not provided in response, add empty array
});
