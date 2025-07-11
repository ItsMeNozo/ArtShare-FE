import { useLoading } from '@/contexts/Loading/useLoading';
import { useEffect } from 'react';

/**
 * A hook to bridge a local loading state to the global LoadingProvider.
 * @param isLoading The boolean loading state to watch.
 * @param message The message to display on the loading screen.
 */
export const useGlobalLoader = (isLoading: boolean, message?: string) => {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (isLoading) {
      showLoading(message);
    } else {
      hideLoading();
    }
  }, [isLoading, message, showLoading, hideLoading]);
};
