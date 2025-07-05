import api from '@/api/baseApi';

/**
 * PATCH /posts/:postId
 *
 * @param postId   numeric ID of the post to update
 * @param formData multipart/form‑data body (same shape as create‑post)
 */
export const updatePost = async (postId: number, formData: FormData) => {
  try {
    const response = await api.patch(`/posts/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('updatePost error:', error);
    throw error;
  }
};
