import api from '@/api/baseApi';

/**
 * Delete a blog post.
 * DELETE /blogs/:id
 */
export const deleteBlog = async (
  blogId: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/blogs/${blogId}`);
  return response.data;
};
