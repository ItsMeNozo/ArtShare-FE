import api from '@/api/baseApi';
import { Post } from '@/types';
import { AxiosError } from 'axios';

interface EnhancedError extends Error {
  status?: number;
  originalError?: unknown;
}

export const createPost = async (formData: FormData) => {
  // Sending POST request
  try {
    const response = await api.post<Post>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error: unknown) {
    console.error('Error:', error);

    // Handle 413 Content Too Large specifically
    if (
      error instanceof Error &&
      (error as AxiosError).response?.status === 413
    ) {
      const enhancedError: EnhancedError = new Error(
        'File size too large. Please use smaller images or reduce the number of images and try again.',
      );
      enhancedError.name = 'ContentTooLargeError';
      enhancedError.status = 413;
      enhancedError.originalError = error;
      throw enhancedError;
    }

    throw error;
  }
};
