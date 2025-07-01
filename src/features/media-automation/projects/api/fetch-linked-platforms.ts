import api from '@/api/baseApi';
import { getQueryParams } from '@/utils';
import { Platform } from '../types/platform';

interface FetchLinkedPlaformsParams {
  platformName?: string;
}

export const fetchLinkedPlatforms = async (
  params: FetchLinkedPlaformsParams,
): Promise<Platform[]> => {
  const queryParams = getQueryParams(params);
  const response = await api.get<Platform[]>(`/platforms${queryParams}`);
  return response.data;
};
