import api from '@/api/baseApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { FacebookAccount, FacebookLoginUrlResponse } from '../../types';
import { fetchFacebookAccountInfo } from '../api/platforms.api';

const getFacebookInitiationUrl = async (
  successUrl: string,
  errorUrl: string,
): Promise<FacebookLoginUrlResponse> => {
  const encodedSuccessUrl = encodeURIComponent(successUrl);
  const encodedErrorUrl = encodeURIComponent(errorUrl);

  const { data } = await api.get(
    `/facebook-integration/initiate-connection-url?successUrl=${encodedSuccessUrl}&errorUrl=${encodedErrorUrl}`,
  );
  return data;
};

export const useFacebookAuth = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const {
    mutate: initiate,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (redirectUrls: { successUrl: string; errorUrl: string }) =>
      getFacebookInitiationUrl(redirectUrls.successUrl, redirectUrls.errorUrl),
    onSuccess: (data) => {
      options?.onSuccess?.();

      if (data.facebookLoginUrl) {
        window.location.href = data.facebookLoginUrl;
      } else {
        console.error('Facebook login URL was not returned from the API.');
        options?.onError?.(new Error('Facebook login URL not found.'));
      }
    },
    onError: (error: Error) => {
      console.error('Failed to get Facebook initiation URL:', error);
      options?.onError?.(error);
    },
  });

  const initiateFacebookConnection = useCallback(() => {
    const currentPageUrl = window.location.href.split('?')[0];
    initiate({
      successUrl: `${currentPageUrl}?status=success`,
      errorUrl: `${currentPageUrl}?status=error`,
    });
  }, [initiate]);

  return {
    initiateFacebookConnection,
    isLoading,
    error,
  };
};

export const useFacebookAccountInfo = () => {
  return useQuery<FacebookAccount[], Error>({
    queryKey: ['facebookAccountInfo'],
    queryFn: fetchFacebookAccountInfo,
    staleTime: 1000 * 60 * 5,
  });
};
