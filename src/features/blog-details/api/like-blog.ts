import api from '@/api/baseApi';
import { TargetType } from '@/types/likes';

// Type definitions
export interface CreateLikeDto {
  targetId: number;
  targetType: TargetType;
}

export interface RemoveLikeDto {
  targetId: number;
  targetType: TargetType;
}

export interface LikeDetailsDto {
  id: number;
  userId: string;
  blogId?: number;
  postId?: number;
  createdAt: string;
}

// API functions
export const createLike = async (
  dto: CreateLikeDto,
): Promise<LikeDetailsDto> => {
  const response = await api.post('/likes', dto);
  return response.data;
};

export const removeLike = async (
  dto: RemoveLikeDto,
): Promise<{ success: boolean }> => {
  const response = await api.delete('/likes', { data: dto });
  return response.data;
};
