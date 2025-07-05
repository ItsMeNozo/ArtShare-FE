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
}

export const generateImages = async (
  payload: ImageGenRequestDto,
): Promise<PromptResult> => {
  try {
    const response = await api.post<PromptResult>(
      '/art-generation/text-to-image',
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
