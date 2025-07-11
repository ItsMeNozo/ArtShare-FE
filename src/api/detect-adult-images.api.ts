import api from './baseApi';

export enum Likelihood {
  VERY_UNLIKELY = 'VERY_UNLIKELY',
  UNLIKELY = 'UNLIKELY',
  POSSIBLE = 'POSSIBLE',
  LIKELY = 'LIKELY',
  VERY_LIKELY = 'VERY_LIKELY',
}

export interface DetectAdultImagesResponse {
  isAdult: boolean;
  annotation: {
    adult: Likelihood;
    spoof: Likelihood;
    medical: Likelihood;
    violence: Likelihood;
    racy: Likelihood;
  };
}

export const detectAdultImages = async (
  imageFiles: File[],
): Promise<DetectAdultImagesResponse[]> => {
  try {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<DetectAdultImagesResponse[]>(
      '/safe-search/detect-adult-images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error detecting adult images:', error);
    throw error;
  }
};
