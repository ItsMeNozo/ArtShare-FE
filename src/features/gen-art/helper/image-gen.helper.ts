import { ModelKey } from '../enum';

export const buildTempPromptResult = (
  userPrompt: string,
  numberOfImages: number,
): PromptResult => {
  return {
    id: -1,
    user_prompt: userPrompt,
    final_prompt: '',
    aspect_ratio: '',
    created_at: new Date().toISOString(),
    camera: '',
    lighting: '',
    model_key: ModelKey.GPT_IMAGE_1,
    number_of_images_generated: numberOfImages,
    style: '',
    user_id: '', // Placeholder, replace with actual user ID if needed
    image_urls: Array(numberOfImages).fill(''),
  };
};
