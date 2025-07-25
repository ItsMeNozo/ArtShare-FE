import api from '@/api/baseApi';
import { Platform } from '../../projects/types/platform';
import { FacebookAccount } from '../../types';

export const fetchPlatforms = async (
  platformName: string,
): Promise<Platform[]> => {
  const { data } = await api.get<Platform[]>('/platforms', {
    params: { platformName: platformName.toUpperCase() },
  });
  return data;
};

export const disconnectPlatform = (platformId: number) => {
  return api.delete(`/platforms/${platformId}`);
};

export const fetchFacebookAccountInfo = async (): Promise<
  FacebookAccount[]
> => {
  const { data } = await api.get('/facebook-integration/account-info');
  return data;
};
