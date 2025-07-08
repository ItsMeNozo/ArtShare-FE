import { detectAdultImages } from '@/api/detect-adult-images.api';
import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation } from '@tanstack/react-query';
import { PostMedia } from '../types/post-media';

interface UseCheckMaturityOptions {
  onSuccess?: (processedMedia: PostMedia[]) => void;
  onError?: (errorMessage: string) => void;
  onSettled?: () => void;
}

export const useCheckMaturity = ({
  onSuccess,
  onError,
  onSettled,
}: UseCheckMaturityOptions = {}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: checkMaturityFn,

    onMutate: () => {
      showLoading('Checking for sensitive content...');
    },

    onSettled: () => {
      hideLoading();
      onSettled?.();
    },

    onSuccess: (processedMedia) => {
      onSuccess?.(processedMedia);
    },

    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'Failed to check for sensitive content.',
      );
      showSnackbar(message, 'error');
      onError?.(message);
    },
  });
};

const checkMaturityFn = async (
  newMediaItems: PostMedia[],
): Promise<PostMedia[]> => {
  const filesToDetect: File[] = newMediaItems.map((media) => media.file!);

  if (filesToDetect.length === 0) {
    return newMediaItems;
  }

  const detectionResults = await detectAdultImages(filesToDetect);

  return newMediaItems.map((mediaItem, index) => ({
    ...mediaItem,
    isMature: detectionResults[index].isAdult,
  }));
};
