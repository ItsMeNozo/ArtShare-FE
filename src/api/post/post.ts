import api from '../baseApi';

export const deletePost = async (postId: number) => {
  try {
    // Use the fetch API to send a PUT request to the presigned URL
    const response = await api.delete(`/posts/${postId}`);
    return response;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
