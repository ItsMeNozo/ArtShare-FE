import api from '@/api/baseApi';
import { Blog } from '@/types/blog';

/**
 * Create a new blog post.
 * POST /blogs
 */
export const createDoc = async (data: Partial<Blog>): Promise<Blog> => {
  const response = await api.post<Blog>('/blogs', data);
  return response.data;
};
