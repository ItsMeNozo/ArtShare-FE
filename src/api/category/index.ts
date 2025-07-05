import api from '@/api/baseApi';
import { CategoryTypeValues } from '@/constants';
import type { Category } from '@/types/category'; // This will now use the updated Category type
import qs from 'qs';

export interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
  type?: CategoryTypeValues;
  searchQuery?: string;
}

export const getCategories = async (
  params: GetCategoriesParams = {},
): Promise<Category[]> => {
  try {
    const queryString = qs.stringify(params, {
      addQueryPrefix: true,
      skipNulls: true,
    });

    const response = await api.get<Category[]>(`/categories${queryString}`);

    // Parse dates from string to Date objects
    return response.data.map((cat) => ({
      ...cat,
      createdAt: new Date(cat.createdAt as string),
      updatedAt: cat.updatedAt ? new Date(cat.updatedAt as string) : null,
    }));
  } catch (error) {
    console.error('Error in getCategories API call:', error);
    throw error;
  }
};
