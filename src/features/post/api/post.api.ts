import api from '@/api/baseApi';
import { Post } from '@/types/post';

export const fetchPost = async (postId: number) => {
  return await api.get<Post>(`/posts/${postId}`);
};

interface LikePayload {
  targetId: number;
  targetType: string;
}
export const likePost = async (postId: number) => {
  const payload: LikePayload = {
    targetId: postId,
    targetType: 'POST',
  };

  return await api.post('/likes', payload);
};

export const unlikePost = async (postId: number) => {
  const payload: LikePayload = {
    targetId: postId,
    targetType: 'POST',
  };

  return await api.delete('/likes', { data: payload });
};
