import api from '@/api/baseApi';
import { Post } from '@/types';

export const createPost = async (formData: FormData) => {
  // Sending POST request
  try {
    const response = await api.post<Post>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
