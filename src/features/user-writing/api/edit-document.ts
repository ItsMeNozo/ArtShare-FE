import api from '@/api/baseApi';
import { Blog } from '@/types/blog';

/**
 * Update an existing blog post.
 * PATCH /blogs/:id
 */
export const updateDoc = async (
  docId: number,
  data: Partial<Blog>,
): Promise<Blog> => {
  const response = await api.patch<Blog>(`/blogs/${docId}`, data);
  return response.data;
};

export const updateDocName = async (docId: number, newTitle: string) => {
  const response = await api.patch(`/blogs/${docId}`, {
    title: newTitle,
  });
  return response.data;
};
