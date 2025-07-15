import api from '@/api/baseApi';

export const createPost = async (formData: FormData) => {
  // Sending POST request
  try {
    const response = await api.post('/posts', formData, {
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
