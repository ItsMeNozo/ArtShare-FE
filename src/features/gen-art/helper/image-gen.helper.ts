import { ModelKey } from '../enum';

export const buildTempPromptResult = (
  userPrompt: string,
  numberOfImages: number,
): PromptResult => {
  return {
    id: -1,
    userPrompt: userPrompt,
    finalPrompt: '',
    aspectRatio: '',
    createdAt: new Date().toISOString(),
    camera: '',
    lighting: '',
    modelKey: ModelKey.GPT_IMAGE_1,
    numberOfImagesGenerated: numberOfImages,
    style: '',
    userId: '', // Placeholder, replace with actual user ID if needed
    imageUrls: Array(numberOfImages).fill(''),
  };
};
