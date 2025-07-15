import api from '@/api/baseApi';
import type { LikingUser } from '../types/user';

/**
 * Fetches the list of users who liked a specific post.
 */
export const fetchPostLikingUsers = async (
  postId: number,
): Promise<LikingUser[]> => {
  const res = await api.get<{ items: LikingUser[]; total: number }>(
    `/posts/${postId}/likes`,
  );
  // If the post route also paginates, use res.data.items
  return res.data.items;
};

/**
 * Fetches the list of users who liked a specific blog.
 */
export const fetchBlogLikingUsers = async (
  blogId: number,
): Promise<LikingUser[]> => {
  const res = await api.get<{ items: LikingUser[]; total: number }>(
    `/blogs/${blogId}/likes`,
  );
  return res.data.items;
};
