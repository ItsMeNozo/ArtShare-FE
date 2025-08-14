import api from '@/api/baseApi';
import { ModelKey } from '../enum';

// request payload
export interface ImageGenRequestDto {
  prompt: string;
  modelKey: ModelKey;
  style: string;
  n: number;
  aspectRatio: string;
  lighting: string;
  camera: string;
  seedImage?: File;
}

export const generateImages = async (
  payload: ImageGenRequestDto,
): Promise<PromptResult> => {
  // create form data from payload
  const formData = new FormData();
  formData.append('prompt', payload.prompt);
  formData.append('modelKey', payload.modelKey);
  formData.append('style', payload.style);
  formData.append('n', payload.n.toString());
  formData.append('aspectRatio', payload.aspectRatio);
  formData.append('lighting', payload.lighting);
  formData.append('camera', payload.camera);
  if (payload.seedImage) {
    formData.append('seedImage', payload.seedImage);
  }

  try {
    const response = await api.post<PromptResult>(
      '/art-generation/text-to-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
