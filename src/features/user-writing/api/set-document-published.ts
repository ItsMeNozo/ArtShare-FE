import api from '@/api/baseApi';

export const updateBlogPublishStatus = async (
  blogId: number,
  isPublished: boolean,
) => {
  const response = await api.patch(`/blogs/${blogId}`, {
    is_published: isPublished,
  });
  return response.data;
};
