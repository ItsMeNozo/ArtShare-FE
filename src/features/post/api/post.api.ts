import api from '@/api/baseApi';
import { Post } from '@/types/post';

export const fetchPost = async (postId: number) => {
  return await api.get<Post>(`/posts/${postId}`);
};

interface LikePayload {
  target_id: number;
  target_type: string;
}
export const likePost = async (postId: number) => {
  const payload: LikePayload = {
    target_id: postId,
    target_type: 'POST',
  };

  return await api.post('/likes', payload);
};

export const unlikePost = async (postId: number) => {
  const payload: LikePayload = {
    target_id: postId,
    target_type: 'POST',
  };

  return await api.delete('/likes', { data: payload });
};
