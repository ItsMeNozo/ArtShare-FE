// src/hooks/useIsMature.ts
import {
  detectAdultImages,
  DetectAdultImagesResponse,
} from '@/api/detect-adult-images.api';
import { useState } from 'react';
import { PostMedia } from '../types/post-media';

interface UseIsMatureReturn {
  checkMaturityForNewItems: (
    newMediaItems: PostMedia[],
  ) => Promise<PostMedia[]>;
  isLoading: boolean;
  isError: boolean;
}

export default function useIsMature(): UseIsMatureReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const checkMaturityForNewItems = async (newMediaItems: PostMedia[]) => {
    if (!newMediaItems || newMediaItems.length === 0) {
      return [];
    }

    setIsLoading(true);

    const imageMediasToProcess: PostMedia[] = [...newMediaItems];

    if (imageMediasToProcess.length === 0) {
      setIsLoading(false);
      return newMediaItems;
    }

    const filesToDetect: File[] = imageMediasToProcess.map(
      (media) => media.file!,
    );
    let processedImageMedias: PostMedia[] = [...imageMediasToProcess];

    try {
      const detectionResults: DetectAdultImagesResponse[] =
        await detectAdultImages(filesToDetect);

      processedImageMedias = imageMediasToProcess.map((mediaItem, index) => ({
        ...mediaItem,
        isMature: detectionResults[index].isAdult,
      }));
    } catch (err) {
      console.error('Error in detectAdultImages:', err);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
    return processedImageMedias;
  };

  return {
    checkMaturityForNewItems,
    isLoading,
    isError,
  };
}
