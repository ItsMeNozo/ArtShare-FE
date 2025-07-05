import api from '@/api/baseApi';

export interface GeneratePostContentResponse {
  title: string;
  description: string;
  categories: { id: number; name: string }[];
}

export const generatePostContent = async (
  formData: FormData,
): Promise<GeneratePostContentResponse> => {
  try {
    const response = await api.post<GeneratePostContentResponse>(
      '/posts/generate-metadata',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error generating post content:', error);
    throw error;
  }
};
