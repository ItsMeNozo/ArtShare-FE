import api from '@/api/baseApi';
import { Blog } from '@/types/blog';

/**
 * Fetch blogs created by the current user.
 * GET /blogs/me
 */
export const fetchMyBlogs = async (params?: {
  take?: number;
  skip?: number;
}): Promise<Blog[]> => {
  const response = await api.get<Blog[]>('/blogs/me', { params });
  return response.data;
};
