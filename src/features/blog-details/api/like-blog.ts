import api from '@/api/baseApi';
import { TargetType } from '@/types/likes';

// Type definitions
export interface CreateLikeDto {
  target_id: number;
  target_type: TargetType;
}

export interface RemoveLikeDto {
  target_id: number;
  target_type: TargetType;
}

export interface LikeDetailsDto {
  id: number;
  user_id: string;
  blog_id?: number;
  post_id?: number;
  created_at: string;
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
